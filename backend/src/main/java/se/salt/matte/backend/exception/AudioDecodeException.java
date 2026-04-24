package se.salt.matte.backend.exception;

public class AudioDecodeException extends RuntimeException {
    public AudioDecodeException() {
        super("Failed to decode audio");
    }
}
