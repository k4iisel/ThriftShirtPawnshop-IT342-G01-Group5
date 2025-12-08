package com.thriftshirt.pawnshop.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thriftshirt.pawnshop.entity.TransactionLog;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.UserRepository;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionLogService transactionLogService;

    /**
     * Get all users (for Admin)
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Toggle user status (Ban/Unban)
     */
    public User toggleUserStatus(Long userId, User adminUser) {
        logger.info("Toggling status for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("ADMIN".equals(user.getRole().name())) {
            throw new IllegalArgumentException("Cannot modify status of an ADMIN account");
        }

        boolean newStatus = !user.isEnabled();
        user.setEnabled(newStatus);

        // If banning, clear active session
        if (!newStatus) {
            user.setActiveSessionId(null);
            user.setSessionCreatedAt(null);
        }

        userRepository.save(user);

        // Log the action
        TransactionLog log = new TransactionLog();
        log.setUser(adminUser);
        log.setAction(newStatus ? "USER_UNBANNED" : "USER_BANNED");
        log.setRemarks((newStatus ? "Unbanned" : "Banned") + " user: " + user.getUsername() + " (ID: " + userId + ")");
        transactionLogService.logTransaction(log);

        logger.info("User {} status changed to: {}", user.getUsername(), newStatus ? "ENABLED" : "DISABLED");
        return user;
    }

    /**
     * Save user (for wallet operations)
     */
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}
