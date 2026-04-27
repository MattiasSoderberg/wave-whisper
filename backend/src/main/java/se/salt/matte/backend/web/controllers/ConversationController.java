package se.salt.matte.backend.web.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import se.salt.matte.backend.domain.models.Conversation;
import se.salt.matte.backend.domain.models.Message;
import se.salt.matte.backend.domain.services.ConversationService;
import se.salt.matte.backend.web.dto.ConversationRequestDto;
import se.salt.matte.backend.web.dto.EncodeMessageRequestDto;

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
    public ResponseEntity<Conversation> startConversation(
            @AuthenticationPrincipal Jwt principal,
            @RequestBody ConversationRequestDto dto) {
        Conversation conversation = conversationService.startConversation(
                principal.getClaimAsString("email"), dto.receiverId()
        );
        return ResponseEntity.ok(conversation);
    }

    @GetMapping
    public ResponseEntity<List<Conversation>> getUserConversations(@AuthenticationPrincipal Jwt principal) {
        List<Conversation> conversations = conversationService.getUserConversations(principal.getClaimAsString("email"));
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
            @AuthenticationPrincipal Jwt principal) {
        Message message = conversationService.encodeConversationMessage(
                id,
                dto.text(),
                principal.getClaimAsString("email"));

        return ResponseEntity.ok(message);
    }

}
