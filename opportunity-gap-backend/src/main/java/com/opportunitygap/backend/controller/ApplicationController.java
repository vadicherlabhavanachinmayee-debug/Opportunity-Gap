
package com.opportunitygap.backend.controller;

import com.opportunitygap.backend.entity.Application;
import com.opportunitygap.backend.service.ApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "http://localhost:5173")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Application>> getApplications(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(
                applicationService.getApplications(userId)
        );
    }

    @PostMapping
    public ResponseEntity<Application> addApplication(
            @RequestBody Application application) {
        return ResponseEntity.ok(
                applicationService.addApplication(application)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateApplication(
            @PathVariable Integer id,
            @RequestBody Map<String, String> request) {
        try {
            return ResponseEntity.ok(
                    applicationService.updateApplication(
                            id, request.get("status")
                    )
            );
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @PathVariable Integer id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
