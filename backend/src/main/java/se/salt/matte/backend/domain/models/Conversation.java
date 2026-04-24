package se.salt.matte.backend.domain.models;

import jakarta.persistence.*;
import net.minidev.json.annotate.JsonIgnore;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "conversations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_a_id", "user_b_id"})
})
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_a_id", nullable = false)
    Profile userA;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_b_id", nullable = false)
    Profile userB;

    @OneToMany(mappedBy = "conversation", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    List<Message> messages;

    @Column(updatable = false)
    LocalDateTime createdAt = LocalDateTime.now();

    public Conversation() {
    }

    public Conversation(Profile userA, Profile userB) {
        if (userA.getId().compareTo(userB.getId()) < 0) {
            this.userA = userA;
            this.userB = userB;
        } else {
            this.userA = userB;
            this.userB = userA;
        }
    }

    public UUID getId() {
        return id;
    }

    public Profile getUserA() {
        return userA;
    }

    public Profile getUserB() {
        return userB;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
