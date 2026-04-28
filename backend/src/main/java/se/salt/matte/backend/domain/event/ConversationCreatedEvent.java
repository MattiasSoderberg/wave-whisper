package se.salt.matte.backend.domain.event;

import se.salt.matte.backend.domain.models.Conversation;

public class ConversationCreatedEvent {

    private final Conversation conversation;

    public ConversationCreatedEvent(Conversation conversation) {
        this.conversation = conversation;
    }

    public Conversation getConversation() {
        return conversation;
    }
}
