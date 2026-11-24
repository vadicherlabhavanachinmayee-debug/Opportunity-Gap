
package com.opportunitygap.backend.service;

import com.opportunitygap.backend.entity.Notification;
import com.opportunitygap.backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotifications(Integer userId) {
        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification createNotification(Notification notification) {
        notification.setIsRead(false);
        return notificationRepository.save(notification);
    }

    public Notification markAsRead(Integer notificationId, Integer userId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized notification access");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Integer userId) {
        List<Notification> notifications =
                notificationRepository.findByUserIdAndIsRead(userId, false);

        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void clearReadNotifications(Integer userId) {
        notificationRepository.deleteByUserIdAndIsRead(userId, true);
    }
}
