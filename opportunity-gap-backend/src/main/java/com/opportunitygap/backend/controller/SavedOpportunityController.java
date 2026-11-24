package com.opportunitygap.backend.controller;

import com.opportunitygap.backend.entity.SavedOpportunity;
import com.opportunitygap.backend.service.SavedOpportunityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-opportunities")
@CrossOrigin(origins = "http://localhost:5173")
public class SavedOpportunityController {

    private final SavedOpportunityService savedService;

    public SavedOpportunityController(SavedOpportunityService savedService) {
        this.savedService = savedService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavedOpportunity>> getSavedOpportunities(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(
                savedService.getSavedOpportunities(userId));
    }

    @PostMapping
    public ResponseEntity<?> saveOpportunity(
            @RequestParam Integer userId,
            @RequestParam Integer opportunityId) {
        try {
            SavedOpportunity saved =
                    savedService.saveOpportunity(userId, opportunityId);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest()
                    .body(exception.getMessage());
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> removeSavedOpportunity(
            @RequestParam Integer userId,
            @RequestParam Integer opportunityId) {
        savedService.removeSavedOpportunity(userId, opportunityId);
        return ResponseEntity.noContent().build();
    }
}