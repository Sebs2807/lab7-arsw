package co.edu.eci.blueprints.controllers;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import co.edu.eci.blueprints.services.BlueprintBroadcastService;
import co.edu.eci.blueprints.services.BlueprintsServices;
import co.edu.eci.blueprints.dto.ApiResponse;
import co.edu.eci.blueprints.model.*;
import co.edu.eci.blueprints.persistence.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Set;

@RestController
@RequestMapping("/api/v1/blueprints")
@CrossOrigin(origins = "http://localhost:5173")
public class BlueprintsAPIController {

    private final BlueprintsServices services;
    private final BlueprintBroadcastService broadcastService;

    public BlueprintsAPIController(BlueprintsServices services, BlueprintBroadcastService broadcastService) {
        this.services = services;
        this.broadcastService = broadcastService;
    }

    // GET /api/v1/blueprints
    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_blueprints.read')")
    public ResponseEntity<ApiResponse<Set<Blueprint>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(200, "OK", services.getAllBlueprints()));
    }

    // GET /api/v1/blueprints/{author}
    @GetMapping("/{author}")
    @PreAuthorize("hasAuthority('SCOPE_blueprints.read')")
    public ResponseEntity<ApiResponse<?>> byAuthor(@PathVariable String author) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(200, "OK", services.getBlueprintsByAuthor(author)));
        } catch (BlueprintNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    // GET /api/v1/blueprints/{author}/{bpname}
    @GetMapping("/{author}/{bpname}")
    @PreAuthorize("hasAuthority('SCOPE_blueprints.read')")
    public ResponseEntity<ApiResponse<?>> byAuthorAndName(@PathVariable String author, @PathVariable String bpname) {
        try {
            return ResponseEntity.ok(new ApiResponse<>(200, "OK", services.getBlueprint(author, bpname)));
        } catch (BlueprintNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    // POST /api/v1/blueprints
    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_blueprints.write')")
    public ResponseEntity<ApiResponse<?>> add(@Valid @RequestBody NewBlueprintRequest req) {
        try {
            Blueprint bp = new Blueprint(req.author(), req.name(), req.points());
            services.addNewBlueprint(bp);
            try {
                broadcastService.sendBlueprintUpdate(bp);
            } catch (Exception ex) {
                System.err.println("Failed to send STOMP message: " + ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(201, "Created", bp));
        } catch (BlueprintPersistenceException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    // PUT /api/v1/blueprints/{author}/{bpname}/points
    @PutMapping("/{author}/{bpname}/points")
    @PreAuthorize("hasAuthority('SCOPE_blueprints.write')")
    public ResponseEntity<ApiResponse<?>> addPoint(@PathVariable String author, @PathVariable String bpname,
            @RequestBody Point p) {
        try {
            services.addPoint(author, bpname, p.x(), p.y());
            broadcastService.sendBlueprintUpdate(services.getBlueprint(author, bpname));
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(new ApiResponse<>(202, "Accepted", null));
        } catch (BlueprintNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    // PUT /api/v1/blueprints/{author}/{bpname}  - update (rename or replace) blueprint
    @PutMapping("/{author}/{bpname}")
    @PreAuthorize("hasAuthority('SCOPE_blueprints.write')")
    public ResponseEntity<ApiResponse<?>> updateBlueprint(@PathVariable String author, @PathVariable String bpname,
            @Valid @RequestBody NewBlueprintRequest req) {
        try {
            Blueprint newBp = new Blueprint(req.author(), req.name(), req.points());
            services.updateBlueprint(author, bpname, newBp);
            // If the update involved a rename (author or name changed), notify clients to remove the old key
            try {
                if (!author.equals(newBp.getAuthor()) || !bpname.equals(newBp.getName())) {
                    // notify deletion of old blueprint first so clients remove the old entry
                    try {
                        broadcastService.sendBlueprintDelete(author, bpname);
                    } catch (Exception ex) {
                        System.err.println("Failed to send STOMP delete message for rename: " + ex.getMessage());
                    }
                }
                // Notify subscribed clients about the updated blueprint
                broadcastService.sendBlueprintUpdate(services.getBlueprint(newBp.getAuthor(), newBp.getName()));
            } catch (Exception ex) {
                System.err.println("Failed to send STOMP message: " + ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body(new ApiResponse<>(202, "Accepted", services.getBlueprint(newBp.getAuthor(), newBp.getName())));
        } catch (BlueprintNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, e.getMessage(), null));
        } catch (BlueprintPersistenceException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ApiResponse<>(400, e.getMessage(), null));
        }
    }

    // DELETE /api/v1/blueprints/{author}/{bpname}  - delete blueprint
    @DeleteMapping("/{author}/{bpname}")
    @PreAuthorize("hasAuthority('SCOPE_blueprints.write')")
    public ResponseEntity<ApiResponse<?>> deleteBlueprint(@PathVariable String author, @PathVariable String bpname) {
        try {
            services.removeBlueprint(author, bpname);
            // notify subscribers about deletion
            try {
                broadcastService.sendBlueprintDelete(author, bpname);
            } catch (Exception ex) {
                System.err.println("Failed to send STOMP delete message: " + ex.getMessage());
            }
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body(new ApiResponse<>(204, "Deleted", null));
        } catch (BlueprintNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse<>(404, e.getMessage(), null));
        }
    }

    public record NewBlueprintRequest(
            @NotBlank String author,
            @NotBlank String name,
            @Valid java.util.List<Point> points) {
    }
}
