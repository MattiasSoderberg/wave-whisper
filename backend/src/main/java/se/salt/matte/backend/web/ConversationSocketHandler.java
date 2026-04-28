package se.salt.matte.backend.web;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import se.salt.matte.backend.domain.event.ConversationCreatedEvent;
import se.salt.matte.backend.domain.event.MessageEncodedEvent;
import se.salt.matte.backend.domain.models.Conversation;
import se.salt.matte.backend.domain.models.Message;

@Component
public class ConversationSocketHandler {

    private final SimpMessagingTemplate messagingTemplate;

    public ConversationSocketHandler(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStartConversation(ConversationCreatedEvent event) {
        Conversation conversation = event.getConversation();
        messagingTemplate.convertAndSend(
                "/topic/profiles/" + conversation.getUserA().getId() + "/conversations",
                event.getConversation());
        messagingTemplate.convertAndSend(
                "/topic/profiles/" + conversation.getUserB().getId() + "/conversations",
                event.getConversation());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleEncodeMessage(MessageEncodedEvent event) {
        Message message = event.getMessage();

        messagingTemplate.convertAndSend(
                "/topic/conversations/" + message.getConversation().getId() + "/messages",
                message);
    }
}
