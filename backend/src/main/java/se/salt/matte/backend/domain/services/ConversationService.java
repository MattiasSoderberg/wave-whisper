package se.salt.matte.backend.domain.services;

import org.springframework.stereotype.Service;
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

    public ConversationService(ConversationRepository conversationRepository,
                               ProfileRepository profileRepository,
                               MessageRepository messageRepository,
                               AudioSteganographyService audioSteganographyService,
                               StorageService storageService) {
        this.conversationRepository = conversationRepository;
        this.profileRepository = profileRepository;
        this.messageRepository = messageRepository;
        this.audioSteganographyService = audioSteganographyService;
        this.storageService = storageService;
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

    public void deleteConversation(UUID id) {
        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(ConversationNotFoundException::new);
        conversationRepository.delete(conversation);
    }

    public List<Message> getConversationMessages(UUID conversationId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(ConversationNotFoundException::new);
        return messageRepository.findByConversationOrderByCreatedAtAsc(conversation);
    }

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
        return messageRepository.save(message);
    }
}
