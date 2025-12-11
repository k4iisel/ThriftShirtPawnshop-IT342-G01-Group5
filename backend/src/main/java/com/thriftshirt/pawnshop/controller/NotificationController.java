package com.thriftshirt.pawnshop.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thriftshirt.pawnshop.dto.response.ApiResponse;
import com.thriftshirt.pawnshop.entity.Notification;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.service.NotificationService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse> getUserNotifications(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            List<Notification> notifications = notificationService.getUserNotifications(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
        } catch (Exception e) {
            logger.error("Error fetching notifications: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch notifications"));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            long count = notificationService.getUnreadCount(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", Map.of("count", count)));
        } catch (Exception e) {
            logger.error("Error fetching unread count: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to fetch unread count"));
        }
    }

    @PutMapping("/{notifId}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long notifId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Notification updated = notificationService.markAsRead(notifId, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Notification marked as read", updated));
        } catch (Exception e) {
            logger.error("Error marking notification as read: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to mark notification as read"));
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            notificationService.markAllAsRead(user.getId());
            return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
        } catch (Exception e) {
            logger.error("Error marking all notifications as read: ", e);
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to mark all as read"));
        }
    }
}
