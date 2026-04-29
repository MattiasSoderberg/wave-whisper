package se.salt.matte.backend.domain.event;

import se.salt.matte.backend.domain.models.Conversation;

import java.util.UUID;

public class ConversationDeletedEvent {

    private final Conversation conversation;
    private final UUID receiverId;
    private final String action;

    public ConversationDeletedEvent(Conversation conversation, UUID receiverId) {
        this.conversation = conversation;
        this.receiverId = receiverId;
        action = "DELETED";
    }

    public Conversation getConversation() {
        return conversation;
    }

    public UUID getReceiverId() {
        return receiverId;
    }

    public String getAction() {
        return action;
    }
}
