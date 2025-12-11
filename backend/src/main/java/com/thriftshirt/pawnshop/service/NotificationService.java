package com.thriftshirt.pawnshop.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thriftshirt.pawnshop.entity.Notification;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.NotificationRepository;
import com.thriftshirt.pawnshop.repository.UserRepository;

@Service
@Transactional
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Create a notification for a specific user
     */
    public Notification createNotification(Long userId, String message, String type) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage(message);
            notification.setType(type); // e.g., "INFO", "SUCCESS", "WARNING", "ERROR"
            notification.setRead(false);
            notification.setTimestamp(LocalDateTime.now());

            Notification saved = notificationRepository.save(notification);
            logger.info("Notification created for user {}: {}", userId, message);
            return saved;
        } catch (Exception e) {
            logger.error("Error creating notification: ", e);
            throw new RuntimeException("Failed to create notification");
        }
    }

    /**
     * Get all notifications for a user
     */
    public List<Notification> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserOrderByTimestampDesc(user);
    }

    /**
     * Get unread notification count
     */
    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    /**
     * Mark a specific notification as read
     */
    public Notification markAsRead(Long notifId, Long userId) {
        Notification notification = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user
     */
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Notification> unread = notificationRepository.findByUserAndIsReadFalseOrderByTimestampDesc(user);
        for (Notification notif : unread) {
            notif.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    /**
     * Delete a notification
     */
    public void deleteNotification(Long notifId, Long userId) {
        Notification notification = notificationRepository.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);
    }
}
