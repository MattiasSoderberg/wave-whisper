package se.salt.matte.backend.exception;

public class ConversationNotFoundException extends NotFoundException {
    public ConversationNotFoundException() {
        super("Conversation not found");
    }
}
