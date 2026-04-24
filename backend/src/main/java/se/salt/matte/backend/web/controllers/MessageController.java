package se.salt.matte.backend.web.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import se.salt.matte.backend.domain.services.MessageService;

import java.io.IOException;

@RestController
@RequestMapping("${spring.api.paths.messages}")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/decode")
    public ResponseEntity<String> decode(@RequestParam("file") MultipartFile file) throws IOException {
        String message = messageService.decode(file.getBytes());
        return ResponseEntity.ok(message);
    }
}
