package se.salt.matte.backend.domain.services;

import org.springframework.stereotype.Service;
import se.salt.matte.backend.domain.models.Profile;
import se.salt.matte.backend.domain.repositories.ProfileRepository;

import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    public Profile syncProfile(String email, String name, String avatarUrl) {
        return repository.findByEmail(email)
                .map(existing -> {
                    existing.setAvatarUrl(avatarUrl);
                    return repository.save(existing);
                })
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setEmail(email);
                    newProfile.setUsername(name);
                    newProfile.setAvatarUrl(avatarUrl);
                    return repository.save(newProfile);
                });
    }

    public List<Profile> searchProfiles(String query) {
        return repository.findByUsernameContainingIgnoreCaseAndIdNot(query, null);
    }
}
