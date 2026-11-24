
package com.opportunitygap.backend.repository;

import com.opportunitygap.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);

    List<Notification> findByUserIdAndIsRead(
        Integer userId,
        Boolean isRead
    );

    void deleteByUserIdAndIsRead(Integer userId, Boolean isRead);
}
