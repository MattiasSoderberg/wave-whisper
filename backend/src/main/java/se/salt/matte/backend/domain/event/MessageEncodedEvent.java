package se.salt.matte.backend.domain.event;

import se.salt.matte.backend.domain.models.Message;

public class MessageEncodedEvent {

    private final Message message;

    public MessageEncodedEvent(Message message) {
        this.message = message;
    }

    public Message getMessage() {
        return message;
    }
}
