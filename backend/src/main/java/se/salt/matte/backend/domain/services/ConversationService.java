package se.salt.matte.backend.domain.services;

import jakarta.transaction.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import se.salt.matte.backend.domain.event.ConversationCreatedEvent;
import se.salt.matte.backend.domain.event.ConversationDeletedEvent;
import se.salt.matte.backend.domain.event.MessageEncodedEvent;
import se.salt.matte.backend.domain.models.Conversation;
import se.salt.matte.backend.domain.models.Message;
import se.salt.matte.backend.domain.models.Profile;
import se.salt.matte.backend.domain.repositories.ConversationRepository;
import se.salt.matte.backend.domain.repositories.MessageRepository;
import se.salt.matte.backend.domain.repositories.ProfileRepository;
import se.salt.matte.backend.exception.ConversationNotFoundException;
import se.salt.matte.backend.exception.ProfileNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ProfileRepository profileRepository;
    private final MessageRepository messageRepository;
    private final AudioSteganographyService audioSteganographyService;
    private final StorageService storageService;
    private final ApplicationEventPublisher eventPublisher;

    public ConversationService(ConversationRepository conversationRepository,
                               ProfileRepository profileRepository,
                               MessageRepository messageRepository,
                               AudioSteganographyService audioSteganographyService,
                               StorageService storageService,
                               ApplicationEventPublisher eventPublisher) {
        this.conversationRepository = conversationRepository;
        this.profileRepository = profileRepository;
        this.messageRepository = messageRepository;
        this.audioSteganographyService = audioSteganographyService;
        this.storageService = storageService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Conversation startConversation(String senderEmail, UUID receiverId) {
        Profile sender = profileRepository.findByEmail(senderEmail).orElseThrow(ProfileNotFoundException::new);
        Profile receiver = profileRepository.findById(receiverId).orElseThrow(ProfileNotFoundException::new);

        Conversation tempConversation = new Conversation(sender, receiver);

        return conversationRepository.findByUserAAndUserB(
                tempConversation.getUserA(), tempConversation.getUserB()
        ).orElseGet(() -> {
            Conversation saved = conversationRepository.save(tempConversation);

            eventPublisher.publishEvent(new ConversationCreatedEvent(saved));
            return saved;
        });
    }

    public List<Conversation> getUserConversations(String email) {
        Profile profile = profileRepository.findByEmail(email).orElseThrow(ProfileNotFoundException::new);
        return conversationRepository.findByUserAOrUserBOrderByCreatedAtDesc(profile, profile);
    }

    @Transactional
    public void deleteConversation(UUID id, String senderEmail) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(ConversationNotFoundException::new);
        UUID receiverId = conversation.getUserA().getEmail().equals(senderEmail) ? conversation.getUserB().getId() : conversation.getUserA().getId();

        eventPublisher.publishEvent(new ConversationDeletedEvent(conversation, receiverId));
        conversationRepository.delete(conversation);
    }

    public List<Message> getConversationMessages(UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(ConversationNotFoundException::new);
        return messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
    }

    @Transactional
    public Message encodeConversationMessage(UUID conversationId, String text, String email) {
        Profile profile = profileRepository.findByEmail(email).orElseThrow(ProfileNotFoundException::new);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(ConversationNotFoundException::new);

        byte[] audioData = audioSteganographyService.encode(text);
        String fileName = storageService.uploadAudio(audioData, conversation.getId());

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(profile);
        message.setFilePath(fileName);

        eventPublisher.publishEvent(new MessageEncodedEvent(message));
        return messageRepository.save(message);
    }
}
