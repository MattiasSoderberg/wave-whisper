package se.salt.matte.backend.web.dto;

public record DecodedMessageResponseDto(String decodedMessage, String audioData) {
    public static DecodedMessageResponseDto toDto(String decodedMessage, String audioData) {
        return new DecodedMessageResponseDto(decodedMessage, audioData);
    }
}
