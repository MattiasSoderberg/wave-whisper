package se.salt.matte.backend.web.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import se.salt.matte.backend.domain.services.MessageService;

import java.io.IOException;

@Controller
@RequestMapping("${spring.api.paths.messages}")
public class MessageController {

    MessageService service;

    public MessageController(MessageService service) {
        this.service = service;
    }
}
