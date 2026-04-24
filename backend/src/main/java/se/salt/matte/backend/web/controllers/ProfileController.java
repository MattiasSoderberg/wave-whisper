package se.salt.matte.backend.web.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import se.salt.matte.backend.domain.models.Profile;
import se.salt.matte.backend.domain.services.ProfileService;
import se.salt.matte.backend.web.dto.ProfileSyncRequestDto;

import java.util.List;

@RestController
@RequestMapping("${spring.api.paths.profiles}")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @PostMapping("/sync")
    public ResponseEntity<Profile> syncProfile(@RequestBody ProfileSyncRequestDto dto) {
        Profile profile = service.syncProfile(dto.email(), dto.name(), dto.avatarUrl());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/search")
    public List<Profile> searchProfiles(@RequestParam String query) {
        return service.searchProfiles(query);
    }
}
