package se.salt.matte.backend.domain.services;

import org.springframework.stereotype.Service;
import se.salt.matte.backend.domain.models.Message;
import se.salt.matte.backend.domain.repositories.MessageRepository;
import se.salt.matte.backend.exception.MessageNotFoundException;

import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final AudioSteganographyService audioSteganographyService;
    private final StorageService storageService;

    public MessageService(
            MessageRepository messageRepository,
            AudioSteganographyService audioSteganographyService,
            StorageService storageService) {
        this.messageRepository = messageRepository;
        this.audioSteganographyService = audioSteganographyService;
        this.storageService = storageService;
    }

    public String decode(UUID id) {
        Message message = messageRepository.findById(id).orElseThrow(MessageNotFoundException::new);
        byte[] audioData = storageService.downloadAudio(message.getFilePath());
        return audioSteganographyService.decode(audioData);
    }
}
