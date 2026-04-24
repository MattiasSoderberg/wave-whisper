package se.salt.matte.backend.domain.services;

import org.springframework.stereotype.Service;

@Service
public class MessageService {

    private final AudioSteganographyService audioSteganographyService;

    public MessageService(AudioSteganographyService audioSteganographyService) {
        this.audioSteganographyService = audioSteganographyService;
    }

    public String decode(byte[] audioData) {
        return audioSteganographyService.decode(audioData);
    }
}
