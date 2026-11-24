
package com.opportunitygap.backend.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class TestController {

    @GetMapping("/api/health")
    public Map<String, String> checkHealth() {
        return Map.of(
            "status", "success",
            "message", "Opportunity Gap Backend is running!"
        );
    }
}
