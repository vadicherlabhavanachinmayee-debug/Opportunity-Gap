
package com.opportunitygap.backend.controller;

import com.opportunitygap.backend.entity.UserProfile;
import com.opportunitygap.backend.service.UserProfileService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.OPTIONS
    }
)
public class UserProfileController {

    private final UserProfileService profileService;

    public UserProfileController(UserProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(@PathVariable Integer userId) {
        UserProfile profile = profileService.getProfile(userId);

        if (profile == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(profile);
    }

    @PostMapping
    public ResponseEntity<UserProfile> saveProfile(
            @RequestBody UserProfile profile) {

        UserProfile saved = profileService.saveProfile(profile);

        return ResponseEntity.ok(saved);
    }
}
