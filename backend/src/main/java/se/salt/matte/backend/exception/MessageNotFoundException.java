package se.salt.matte.backend.exception;

public class MessageNotFoundException extends NotFoundException {
    public MessageNotFoundException() {
        super("Message not found");
    }
}
