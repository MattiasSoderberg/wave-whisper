package se.salt.matte.backend.domain.event;

import se.salt.matte.backend.domain.models.Conversation;

public class ConversationCreatedEvent {

    private final Conversation conversation;
    private final String action;

    public ConversationCreatedEvent(Conversation conversation) {
        this.conversation = conversation;
        action = "CREATED";
    }

    public Conversation getConversation() {
        return conversation;
    }

    public String getAction() {
        return action;
    }
}
