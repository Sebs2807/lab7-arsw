package co.edu.eci.blueprints.persistence;

import co.edu.eci.blueprints.model.Blueprint;
import co.edu.eci.blueprints.model.Point;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryBlueprintPersistence implements BlueprintPersistence {

    private final Map<String, Blueprint> blueprints = new ConcurrentHashMap<>();

    public InMemoryBlueprintPersistence() {
        // Sample data 1:1 style (author/name key)
        Blueprint bp1 = new Blueprint("john", "house",
                List.of(new Point(0,0), new Point(10,0), new Point(10,10), new Point(0,10)));
        Blueprint bp2 = new Blueprint("john", "garage",
                List.of(new Point(5,5), new Point(15,5), new Point(15,15)));
        Blueprint bp3 = new Blueprint("jane", "garden",
                List.of(new Point(2,2), new Point(3,4), new Point(6,7)));
        blueprints.put(keyOf(bp1), bp1);
        blueprints.put(keyOf(bp2), bp2);
        blueprints.put(keyOf(bp3), bp3);
    }

    private String keyOf(Blueprint bp) { return bp.getAuthor() + ":" + bp.getName(); }
    private String keyOf(String author, String name) { return author + ":" + name; }

    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        String k = keyOf(bp);
        if (blueprints.containsKey(k)) throw new BlueprintPersistenceException("Blueprint already exists: " + k);
        blueprints.put(k, bp);
    }

    @Override
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        Blueprint bp = blueprints.get(keyOf(author, name));
        if (bp == null) throw new BlueprintNotFoundException("Blueprint not found: %s/%s".formatted(author, name));
        return bp;
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> set = blueprints.values().stream()
                .filter(bp -> bp.getAuthor().equals(author))
                .collect(Collectors.toSet());
        if (set.isEmpty()) throw new BlueprintNotFoundException("No blueprints for author: " + author);
        return set;
    }

    @Override
    public Set<Blueprint> getAllBlueprints() {
        return new HashSet<>(blueprints.values());
    }

    @Override
    public void addPoint(String author, String name, int x, int y) throws BlueprintNotFoundException {
        Blueprint bp = getBlueprint(author, name);
        bp.addPoint(new Point(x, y));
    }
}
