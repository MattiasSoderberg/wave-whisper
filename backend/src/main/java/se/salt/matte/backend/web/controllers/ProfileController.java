package se.salt.matte.backend.web.controllers;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
        Profile profile = service.syncProfile(dto.email(), dto.username(), dto.avatarUrl());
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/search")
    public List<Profile> searchProfiles(@RequestParam String query, @AuthenticationPrincipal Jwt principal) {
        return service.searchProfiles(query, principal.getClaimAsString("email"));
    }
}
