package se.salt.matte.backend.domain.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import se.salt.matte.backend.domain.models.Profile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    Optional<Profile> findByEmail(String email);
    List<Profile> findByUsernameContainingIgnoreCaseAndIdNot(String username, UUID id);
}
