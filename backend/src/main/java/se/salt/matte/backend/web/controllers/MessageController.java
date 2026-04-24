package se.salt.matte.backend.web.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.salt.matte.backend.domain.services.MessageService;

import java.util.UUID;

@RestController
@RequestMapping("${spring.api.paths.messages}")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/{id}/decode")
    public ResponseEntity<String> decode(@PathVariable UUID id) {
        String message = messageService.decode(id);
        return ResponseEntity.ok(message);
    }
}
