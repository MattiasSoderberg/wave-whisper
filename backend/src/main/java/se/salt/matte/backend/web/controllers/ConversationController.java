package se.salt.matte.backend.web.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.salt.matte.backend.domain.models.Conversation;
import se.salt.matte.backend.domain.models.Message;
import se.salt.matte.backend.domain.services.ConversationService;
import se.salt.matte.backend.web.dto.EncodeMessageRequestDto;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("${spring.api.paths.conversations}")
public class ConversationController {

    private final ConversationService conversationService;

    public ConversationController(ConversationService conversationService) {
        this.conversationService = conversationService;
    }

    @PostMapping
    public ResponseEntity<Conversation> startConversation(Principal principal, @RequestParam UUID receiverId) {
        Conversation conversation = conversationService.startConversation(
                principal.getName(), receiverId
        );
        return ResponseEntity.ok(conversation);
    }

    @GetMapping
    public ResponseEntity<List<Conversation>> getUserConversations(Principal principal) {
        List<Conversation> conversations = conversationService.getUserConversations(principal.getName());
        return ResponseEntity.ok(conversations);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteConversation(@PathVariable UUID id) {
        conversationService.deleteConversation(id);
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<Message>> getConversationMessages(@PathVariable UUID id) {
        List<Message> messages = conversationService.getConversationMessages(id);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{id}/messages/encode")
    public ResponseEntity<Message> encodeConversationMessage(
            @PathVariable UUID id,
            @RequestBody EncodeMessageRequestDto dto,
            Principal principal) {
        Message message = conversationService.encodeConversationMessage(id, dto.text(), principal.getName());

        return ResponseEntity.ok(message);
    }

}
