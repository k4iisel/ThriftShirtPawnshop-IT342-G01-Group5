package com.thriftshirt.pawnshop.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.DeleteMapping;
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
        User user = (User) authentication.getPrincipal();
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse> getUnreadCount(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }

    @PutMapping("/{notifId}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long notifId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationService.markAsRead(notifId, user.getId());
        return ResponseEntity.ok(ApiResponse.success("Marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read"));
    }

    @DeleteMapping("/{notifId}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Long notifId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        try {
            notificationService.deleteNotification(notifId, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting notification: ", e);
            return ResponseEntity.status(400).body(ApiResponse.error(e.getMessage()));
        }
    }
}
