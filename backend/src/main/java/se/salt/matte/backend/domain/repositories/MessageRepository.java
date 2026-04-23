package se.salt.matte.backend.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import se.salt.matte.backend.domain.models.Conversation;
import se.salt.matte.backend.domain.models.Message;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
}
