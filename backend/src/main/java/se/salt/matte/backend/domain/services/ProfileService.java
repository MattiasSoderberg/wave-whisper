package se.salt.matte.backend.domain.services;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import se.salt.matte.backend.domain.models.Profile;
import se.salt.matte.backend.domain.repositories.ProfileRepository;
import se.salt.matte.backend.exception.ProfileNotFoundException;

import java.util.List;
import java.util.UUID;

@Service
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public Profile syncProfile(String email, String name, String avatarUrl) {
        return repository.findByEmail(email)
                .map(existing -> {
                    existing.setAvatarUrl(avatarUrl);
                    return repository.save(existing);
                })
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setEmail(email);
                    newProfile.setAvatarUrl(avatarUrl);

                    String finalUsername = name;
                    if (repository.existsByUsername(name)) {
                        String suffix = UUID.randomUUID().toString().substring(0, 4);
                        finalUsername = name + "-" + suffix;
                    }
                    newProfile.setUsername(finalUsername);
                    return repository.save(newProfile);
                });
    }

    public List<Profile> searchProfiles(String query, String email) {
        Profile profile = repository.findByEmail(email).orElseThrow(ProfileNotFoundException::new);
        return repository.findByUsernameContainingIgnoreCaseAndIdNot(query, profile.getId());
    }
}
