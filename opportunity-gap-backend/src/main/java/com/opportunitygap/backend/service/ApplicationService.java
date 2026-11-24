
package com.opportunitygap.backend.service;

import com.opportunitygap.backend.entity.Application;
import com.opportunitygap.backend.entity.Notification;
import com.opportunitygap.backend.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final NotificationService notificationService;

    public ApplicationService(
            ApplicationRepository applicationRepository,
            NotificationService notificationService) {
        this.applicationRepository = applicationRepository;
        this.notificationService = notificationService;
    }

    public List<Application> getApplications(Integer userId) {
        return applicationRepository.findByUserId(userId);
    }

    public Application addApplication(Application application) {
        if (application.getApplicationDate() == null) {
            application.setApplicationDate(LocalDate.now());
        }

        Application saved = applicationRepository.save(application);

        Notification notification = new Notification();
        notification.setUserId(saved.getUserId());
        notification.setTitle("Application Added");
        notification.setMessage(
                "Your application for " + saved.getTitle()
                + " at " + saved.getOrganization()
                + " has been added to your tracker."
        );
        notification.setNotificationType("APPLICATION");

        notificationService.createNotification(notification);

        return saved;
    }

    public Application updateApplication(Integer id, String status) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        String oldStatus = application.getStatus();

        application.setStatus(status);
        Application updated = applicationRepository.save(application);

        if (status != null && !status.equalsIgnoreCase(
                oldStatus == null ? "" : oldStatus)) {

            Notification notification = new Notification();
            notification.setUserId(application.getUserId());
            notification.setTitle("Application Status Updated");
            notification.setMessage(
                    "Your application for " + application.getTitle()
                    + " at " + application.getOrganization()
                    + " has been updated to: " + status + "."
            );
            notification.setNotificationType("APPLICATION_STATUS");

            notificationService.createNotification(notification);
        }

        return updated;
    }

    public void deleteApplication(Integer id) {
        applicationRepository.deleteById(id);
    }
}
