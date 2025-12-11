package com.thriftshirt.pawnshop.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.thriftshirt.pawnshop.entity.Notification;
import com.thriftshirt.pawnshop.entity.User;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find all notifications for a specific user, ordered by newest first
    List<Notification> findByUserOrderByTimestampDesc(User user);

    // Count unread notifications for a user
    long countByUserAndIsReadFalse(User user);

    // Find unread notifications for a user
    List<Notification> findByUserAndIsReadFalseOrderByTimestampDesc(User user);
}
