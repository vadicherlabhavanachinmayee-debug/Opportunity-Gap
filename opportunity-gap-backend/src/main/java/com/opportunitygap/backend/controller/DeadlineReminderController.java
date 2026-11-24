
package com.opportunitygap.backend.controller;

import com.opportunitygap.backend.service.DeadlineReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/deadline-reminders")
@CrossOrigin(origins = "http://localhost:5173")
public class DeadlineReminderController {

    private final DeadlineReminderService reminderService;

    public DeadlineReminderController(
            DeadlineReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateReminders() {

        int count = reminderService.generateDeadlineReminders();

        return ResponseEntity.ok(Map.of(
                "message", "Deadline reminders generated successfully",
                "notificationsCreated", count
        ));
    }
}
