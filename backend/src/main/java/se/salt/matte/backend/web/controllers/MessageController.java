package se.salt.matte.backend.web.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.salt.matte.backend.domain.services.MessageService;
import se.salt.matte.backend.web.dto.DecodedMessageResponseDto;

import java.util.Base64;
import java.util.UUID;

@RestController
@RequestMapping("${spring.api.paths.messages}")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping("/{id}/decode")
    public ResponseEntity<DecodedMessageResponseDto> decode(@PathVariable UUID id) {
        byte[] audioData = messageService.getAudioData(id);
        String message = messageService.decode(audioData);
        return ResponseEntity.ok(DecodedMessageResponseDto.toDto(
                message,
                Base64.getEncoder().encodeToString(audioData)));
    }
}
