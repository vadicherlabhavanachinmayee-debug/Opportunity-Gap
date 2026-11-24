
package com.opportunitygap.backend.controller;

import com.opportunitygap.backend.entity.Notification;
import com.opportunitygap.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotifications(
            @PathVariable Integer userId) {
        return ResponseEntity.ok(
                notificationService.getNotifications(userId)
        );
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(
            @RequestBody Notification notification) {
        return ResponseEntity.ok(
                notificationService.createNotification(notification)
        );
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable Integer notificationId,
            @RequestParam Integer userId) {
        try {
            return ResponseEntity.ok(
                    notificationService.markAsRead(notificationId, userId)
            );
        } catch (RuntimeException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        }
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @PathVariable Integer userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/user/{userId}/clear-read")
    public ResponseEntity<Void> clearRead(
            @PathVariable Integer userId) {
        notificationService.clearReadNotifications(userId);
        return ResponseEntity.noContent().build();
    }
}
