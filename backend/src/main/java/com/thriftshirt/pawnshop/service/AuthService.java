package com.thriftshirt.pawnshop.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.thriftshirt.pawnshop.dto.request.ChangePasswordRequest;
import com.thriftshirt.pawnshop.dto.request.LoginRequest;
import com.thriftshirt.pawnshop.dto.request.RegisterRequest;
import com.thriftshirt.pawnshop.dto.response.AuthResponse;
import com.thriftshirt.pawnshop.dto.response.UserProfileResponse;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.exception.BadRequestException;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.UserRepository;
import com.thriftshirt.pawnshop.security.JwtTokenProvider;

@Service
public class AuthService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    public AuthResponse loginUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        // Check if user is not an admin
        if (user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Admin accounts cannot login through user portal. Please use admin login.");
        }
        
        // Refresh user from database to get latest session state
        User refreshedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        System.out.println("User login attempt for: " + refreshedUser.getUsername() + 
                          ", Active Session ID: " + refreshedUser.getActiveSessionId() + 
                          ", Session Created At: " + refreshedUser.getSessionCreatedAt());
        
        // Clear any existing session - allow re-login after logout
        if (refreshedUser.getActiveSessionId() != null) {
            System.out.println("Clearing existing session for: " + refreshedUser.getUsername());
            refreshedUser.setActiveSessionId(null);
            refreshedUser.setSessionCreatedAt(null);
        }
        
        // Use refreshed user for session creation
        user = refreshedUser;
        
        // Generate new session ID and update user
        String sessionId = UUID.randomUUID().toString();
        user.setActiveSessionId(sessionId);
        user.setSessionCreatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        String jwt = tokenProvider.generateTokenWithSessionId(authentication, sessionId);
        
        return new AuthResponse(jwt, user.getUsername(), user.getEmail(), user.getRole().name());
    }
    
    public AuthResponse loginAdmin(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        // Check if user is an admin
        if (!user.getRole().name().equals("ADMIN")) {
            throw new BadRequestException("Only admin accounts can login through admin portal.");
        }
        
        // Refresh user from database to get latest session state
        User refreshedUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        System.out.println("Admin login attempt for: " + refreshedUser.getUsername() + 
                          ", Active Session ID: " + refreshedUser.getActiveSessionId() + 
                          ", Session Created At: " + refreshedUser.getSessionCreatedAt());
        
        // Clear any existing session - allow re-login after logout
        if (refreshedUser.getActiveSessionId() != null) {
            System.out.println("Clearing existing session for admin: " + refreshedUser.getUsername());
            refreshedUser.setActiveSessionId(null);
            refreshedUser.setSessionCreatedAt(null);
        }
        
        // Use refreshed user for session creation
        user = refreshedUser;
        
        // Generate new session ID and update user
        String sessionId = UUID.randomUUID().toString();
        user.setActiveSessionId(sessionId);
        user.setSessionCreatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        String jwt = tokenProvider.generateTokenWithSessionId(authentication, sessionId);
        
        return new AuthResponse(jwt, user.getUsername(), user.getEmail(), user.getRole().name());
    }
    
    public AuthResponse register(RegisterRequest registerRequest) {
        // Check if username exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }
        
        // Check if email exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email is already in use!");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setAddress(registerRequest.getAddress());
        
        User savedUser = userRepository.save(user);
        
        // Return response without JWT token (user must login separately)
        return new AuthResponse(null, savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole().name());
    }
    
    public UserProfileResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        return new UserProfileResponse(user);
    }
    
    public void changePassword(String username, ChangePasswordRequest changePasswordRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        // Verify current password
        if (!passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        // Check if new passwords match
        if (!changePasswordRequest.getNewPassword().equals(changePasswordRequest.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }
    
    public UserProfileResponse updateProfile(String username, UserProfileResponse profileRequest) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        // Update user details
        if (profileRequest.getFirstName() != null) {
            user.setFirstName(profileRequest.getFirstName());
        }
        if (profileRequest.getLastName() != null) {
            user.setLastName(profileRequest.getLastName());
        }
        if (profileRequest.getPhoneNumber() != null) {
            user.setPhoneNumber(profileRequest.getPhoneNumber());
        }
        if (profileRequest.getAddress() != null) {
            user.setAddress(profileRequest.getAddress());
        }
        
        User updatedUser = userRepository.save(user);
        return new UserProfileResponse(updatedUser);
    }
    
    public void createDefaultAdmin() {
        String adminUsername = "admin";
        String adminEmail = "admin@thriftshirt.com";
        
        if (!userRepository.existsByUsername(adminUsername) && !userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("tsps2025"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setRole(com.thriftshirt.pawnshop.entity.Role.ADMIN);
            admin.setPhoneNumber("+1234567890");
            admin.setAddress("Admin Office, Thrift Shirt Pawnshop");
            
            userRepository.save(admin);
        }
    }
    
    public void logout(String username) {
        try {
            User user = userRepository.findByUsername(username)
                    .orElse(null);
            
            if (user != null) {
                System.out.println("Logout requested for user: " + username + 
                                  ", Current Session ID: " + user.getActiveSessionId() + 
                                  ", Session Created At: " + user.getSessionCreatedAt());
                
                // Force clear session data and mark logout time
                user.setActiveSessionId(null);
                user.setSessionCreatedAt(null);
                user.setUpdatedAt(LocalDateTime.now());
                
                // Force save and flush to database
                User savedUser = userRepository.saveAndFlush(user);
                
                System.out.println("Logout completed for user: " + username + 
                                  ", Session cleared: " + (savedUser.getActiveSessionId() == null) + 
                                  ", Timestamp cleared: " + (savedUser.getSessionCreatedAt() == null));
            } else {
                System.out.println("Logout requested for non-existent user: " + username);
            }
        } catch (Exception e) {
            // Log error but don't throw exception to avoid blocking logout
            logger.error("Error during logout for user: {} - {}", username, e.getMessage(), e);
        }
    }
    
    // Method to clear all expired sessions (can be called periodically)
    public void clearExpiredSessions() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(1);
            List<User> usersWithExpiredSessions = userRepository.findAll().stream()
                    .filter(user -> user.getActiveSessionId() != null && 
                                   user.getSessionCreatedAt() != null && 
                                   user.getSessionCreatedAt().isBefore(cutoff))
                    .toList();
            
            for (User user : usersWithExpiredSessions) {
                user.setActiveSessionId(null);
                user.setSessionCreatedAt(null);
                userRepository.save(user);
            }
        } catch (Exception e) {
            System.err.println("Error clearing expired sessions: " + e.getMessage());
        }
    }
}