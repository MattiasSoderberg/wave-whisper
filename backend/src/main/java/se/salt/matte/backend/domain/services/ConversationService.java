package se.salt.matte.backend.domain.services;

import org.springframework.stereotype.Service;
import se.salt.matte.backend.domain.models.Conversation;
import se.salt.matte.backend.domain.models.Profile;
import se.salt.matte.backend.domain.repositories.ConversationRepository;
import se.salt.matte.backend.domain.repositories.ProfileRepository;
import se.salt.matte.backend.exception.ProfileNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ProfileRepository profileRepository;

    public ConversationService(ConversationRepository conversationRepository,
                               ProfileRepository profileRepository) {
        this.conversationRepository = conversationRepository;
        this.profileRepository = profileRepository;
    }

    public Conversation startConversation(String senderEmail, UUID receiverId) {
        Profile sender = profileRepository.findByEmail(senderEmail).orElseThrow(ProfileNotFoundException::new);
        Profile receiver = profileRepository.findById(receiverId).orElseThrow(ProfileNotFoundException::new);

        Conversation tempConversation = new Conversation(sender, receiver);

        return conversationRepository.findByUserAAndUserB(
                tempConversation.getUserA(), tempConversation.getUserB()
        ).orElseGet(() -> conversationRepository.save(tempConversation));
    }

    public List<Conversation> getUserConversations(String email) {
        Profile profile = profileRepository.findByEmail(email).orElseThrow(ProfileNotFoundException::new);
        return conversationRepository.findByUserAOrUserBOrderByCreatedAtDesc(profile, profile);
    }
}
