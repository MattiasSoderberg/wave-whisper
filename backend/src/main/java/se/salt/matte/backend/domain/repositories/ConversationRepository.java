package se.salt.matte.backend.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import se.salt.matte.backend.domain.models.Conversation;
import se.salt.matte.backend.domain.models.Profile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {
    Optional<Conversation> findByUserAAndUserB(Profile userA, Profile userB);

    List<Conversation> findByUserAOrUserBOrderByCreatedAtDesc(Profile userA, Profile userB);
}
