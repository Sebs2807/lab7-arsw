package co.edu.eci.blueprints.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import co.edu.eci.blueprints.model.Blueprint;

@Service
public class BlueprintBroadcastService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendBlueprintUpdate(Blueprint bp) {
        messagingTemplate.convertAndSend("/topic/blueprints", bp);
    }

    public void sendBlueprintDelete(String author, String name) {
        var payload = java.util.Map.of(
                "action", "delete",
                "author", author,
                "name", name
        );
        messagingTemplate.convertAndSend("/topic/blueprints", payload);
    }
}
