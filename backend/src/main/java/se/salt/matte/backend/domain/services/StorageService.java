package se.salt.matte.backend.domain.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import se.salt.matte.backend.config.AudioProperties;

import java.util.UUID;

@Service
public class StorageService {

    private final RestClient restClient;
    private final AudioProperties audioProperties;

    public StorageService(
            AudioProperties audioProperties,
            @Value("${spring.storage.url}") String url,
            @Value("${spring.storage.key}") String key,
            @Value("${spring.storage.bucket}") String bucketName
    ) {
        this.audioProperties = audioProperties;
        this.restClient = RestClient.builder()
                .baseUrl(url + "/" + bucketName)
                .defaultHeader("Authorization", "Bearer " + key)
                .defaultHeader("apikey", key)
                .build();
    }

    public String uploadAudio(byte[] audio) {
        String fileName = UUID.randomUUID() + audioProperties.getFileExtension();

        try {
            restClient.post()
                    .uri("/" + fileName)
                    .contentType(MediaType.parseMediaType("audio/wav"))
                    .body(audio)
                    .retrieve()
                    .toBodilessEntity();

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload audio file", e);
        }

        return fileName;
    }
}
