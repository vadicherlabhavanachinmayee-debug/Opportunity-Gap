
package com.opportunitygap.backend.service;

import com.opportunitygap.backend.entity.Notification;
import com.opportunitygap.backend.entity.Opportunity;
import com.opportunitygap.backend.entity.SavedOpportunity;
import com.opportunitygap.backend.repository.OpportunityRepository;
import com.opportunitygap.backend.repository.SavedOpportunityRepository;
import com.opportunitygap.backend.repository.NotificationRepository;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
public class DeadlineReminderService {

    private final OpportunityRepository opportunityRepository;
    private final SavedOpportunityRepository savedOpportunityRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    public DeadlineReminderService(
            OpportunityRepository opportunityRepository,
            SavedOpportunityRepository savedOpportunityRepository,
            NotificationService notificationService,
            NotificationRepository notificationRepository) {

        this.opportunityRepository = opportunityRepository;
        this.savedOpportunityRepository = savedOpportunityRepository;
        this.notificationService = notificationService;
        this.notificationRepository = notificationRepository;
    }

    // Automatically check every 6 hours (IST)
    @Scheduled(cron = "0 0 */6 * * *", zone = "Asia/Kolkata")
    public void scheduledDeadlineReminders() {
        generateDeadlineReminders();
    }

    public int generateDeadlineReminders() {

        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        LocalDate reminderDate = today.plusDays(3);

        List<SavedOpportunity> savedItems =
                savedOpportunityRepository.findAll();

        int createdCount = 0;

        for (SavedOpportunity saved : savedItems) {

            Opportunity opportunity = opportunityRepository
                    .findById(saved.getOpportunityId())
                    .orElse(null);

            if (opportunity == null || opportunity.getDeadline() == null) {
                continue;
            }

            // Check whether the deadline is within the next 3 days
            if (!opportunity.getDeadline().isAfter(today)
                    || opportunity.getDeadline().isAfter(reminderDate)) {
                continue;
            }

            // Prevent duplicate reminders
            boolean alreadyNotified = notificationRepository
                    .findByUserIdOrderByCreatedAtDesc(saved.getUserId())
                    .stream()
                    .anyMatch(notification ->
                            "DEADLINE_REMINDER".equals(
                                    notification.getNotificationType())
                            && notification.getMessage().contains(
                                    opportunity.getTitle())
                            && notification.getMessage().contains(
                                    opportunity.getDeadline().toString())
                    );

            if (alreadyNotified) {
                continue;
            }

            Notification notification = new Notification();

            notification.setUserId(saved.getUserId());
            notification.setTitle("Upcoming Opportunity Deadline");
            notification.setMessage(
                    opportunity.getTitle()
                    + " at " + opportunity.getOrganization()
                    + " closes on " + opportunity.getDeadline()
                    + ". Apply before the deadline!"
            );
            notification.setNotificationType("DEADLINE_REMINDER");

            notificationService.createNotification(notification);
            createdCount++;
        }

        return createdCount;
    }
}
