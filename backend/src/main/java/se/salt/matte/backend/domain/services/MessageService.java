package se.salt.matte.backend.domain.services;

import org.springframework.stereotype.Service;
import se.salt.matte.backend.domain.repositories.MessageRepository;

@Service
public class MessageService {

    MessageRepository repository;

    public MessageService(MessageRepository repository) {
        this.repository = repository;
    }
}
