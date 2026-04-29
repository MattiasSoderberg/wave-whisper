package se.salt.matte.backend.domain.event;

import se.salt.matte.backend.domain.models.Conversation;

public record ConversationSocketMessage(String action, Conversation data) {
}
