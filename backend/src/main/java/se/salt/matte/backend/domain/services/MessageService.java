package se.salt.matte.backend.domain.services;

import org.springframework.stereotype.Service;
import se.salt.matte.backend.domain.models.Message;
import se.salt.matte.backend.domain.models.Profile;
import se.salt.matte.backend.domain.repositories.MessageRepository;

import java.util.UUID;

@Service
public class MessageService {

    MessageRepository repository;
    AudioSteganographyService audioSteganographyService;

    public MessageService(MessageRepository repository,
                          AudioSteganographyService audioSteganographyService) {
        this.repository = repository;
        this.audioSteganographyService = audioSteganographyService;
    }

    public Message encodeAndSave(UUID conversationId, String text, Profile sender) {
        byte[] audioByteArray = audioSteganographyService.encode(text);
        return null;
    }
}
