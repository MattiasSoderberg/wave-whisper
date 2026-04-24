package se.salt.matte.backend.domain.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @GeneratedValue( strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne()
    @JoinColumn(name = "conversation_id", nullable = false)
    Conversation conversation;

    @ManyToOne()
    @JoinColumn(name = "sender_id", nullable = false)
    Profile sender;

    @Column(nullable = false)
    String filePath;

    @Column(updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    public Message() {
    }

    public Message(Conversation conversation, Profile sender, String filePath) {
        this.conversation = conversation;
        this.sender = sender;
        this.filePath = filePath;
    }

    public UUID getId() {
        return id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public Profile getSender() {
        return sender;
    }

    public void setSender(Profile sender) {
        this.sender = sender;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
