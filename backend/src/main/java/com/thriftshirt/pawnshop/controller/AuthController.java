package com.thriftshirt.pawnshop.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thriftshirt.pawnshop.dto.request.ChangePasswordRequest;
import com.thriftshirt.pawnshop.dto.request.LoginRequest;
import com.thriftshirt.pawnshop.dto.request.RegisterRequest;
import com.thriftshirt.pawnshop.dto.response.ApiResponse;
import com.thriftshirt.pawnshop.dto.response.AuthResponse;
import com.thriftshirt.pawnshop.dto.response.UserProfileResponse;
import com.thriftshirt.pawnshop.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            logger.info("User login attempt for: {}", loginRequest.getUsernameOrEmail());
            AuthResponse authResponse = authService.loginUser(loginRequest);
            logger.info("User login successful for: {}", loginRequest.getUsernameOrEmail());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("User login failed for: {} - Error: {}", loginRequest.getUsernameOrEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, null, e.getMessage()));
        }
    }

    @GetMapping("/check-user-session")
    public ResponseEntity<ApiResponse> checkUserSession() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                // User is already logged in
                Map<String, Object> response = Map.of(
                    "hasActiveSession", true,
                    "username", authentication.getName(),
                    "message", "Cannot access admin portal while logged in as a user"
                );
                
                return ResponseEntity.ok(new ApiResponse(true, "User session detected", response));
            }
            
            // No active user session
            Map<String, Object> response = Map.of("hasActiveSession", false);
            return ResponseEntity.ok(new ApiResponse(true, "No active user session", response));
            
        } catch (Exception e) {
            logger.error("Error checking user session: {}", e.getMessage());
            Map<String, Object> response = Map.of("hasActiveSession", false);
            return ResponseEntity.ok(new ApiResponse(true, "Session check completed", response));
        }
    }

    @GetMapping("/admin/access-check")
    public ResponseEntity<ApiResponse> checkAdminAccess() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                logger.warn("🚫 ADMIN ACCESS BLOCKED - User '{}' attempting to access admin while logged in as regular user", 
                    authentication.getName());
                    
                return ResponseEntity.status(403).body(
                    new ApiResponse(false, 
                        "Access Denied: You cannot access admin portal while logged in as a regular user. Please logout first.", 
                        null)
                );
            }
            
            logger.info("✅ Admin access check passed - No active user session detected");
            return ResponseEntity.ok(new ApiResponse(true, "Admin access allowed", null));
            
        } catch (Exception e) {
            logger.error("❌ Error checking admin access: {}", e.getMessage());
            return ResponseEntity.status(500).body(
                new ApiResponse(false, "Error validating admin access permissions", null)
            );
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Check if there's an active user session first
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated() && 
                !authentication.getName().equals("anonymousUser")) {
                
                logger.warn("🚫 ADMIN LOGIN BLOCKED - User '{}' attempted admin login while authenticated as regular user", 
                    authentication.getName());
                    
                return ResponseEntity.status(403).body(
                    new AuthResponse(null, null, null, null, 
                        "🚫 Access Denied: Cannot access admin login while logged in as a regular user. Please logout first.")
                );
            }
            
            logger.info("Admin login attempt for: {}", loginRequest.getUsernameOrEmail());
            AuthResponse authResponse = authService.loginAdmin(loginRequest);
            logger.info("Admin login successful for: {}", loginRequest.getUsernameOrEmail());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Admin login failed for: {} - Error: {}", loginRequest.getUsernameOrEmail(), e.getMessage());
            return ResponseEntity.badRequest().body(new AuthResponse(null, null, null, null, e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Registration attempt for username: {}", registerRequest.getUsername());
        try {
            AuthResponse authResponse = authService.register(registerRequest);
            logger.info("Registration successful for username: {}", registerRequest.getUsername());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Registration failed for username: {} - Error: {}", registerRequest.getUsername(),
                    e.getMessage());
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(Authentication authentication) {
        try {
            if (authentication != null) {
                String username = authentication.getName();
                logger.info("Logout requested for user: {}", username);
                authService.logout(username);
                logger.info("User {} logged out successfully", username);
            }
            SecurityContextHolder.clearContext();
            return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
        } catch (Exception e) {
            logger.error("Logout failed: {}", e.getMessage());
            // Always return success to prevent client-side issues
            return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse userProfile = authService.getCurrentUser(username);
        return ResponseEntity.ok(userProfile);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestBody UserProfileResponse profileRequest,
            Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse updatedProfile = authService.updateProfile(username, profileRequest);
        return ResponseEntity.ok(updatedProfile);
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest,
            Authentication authentication) {
        String username = authentication.getName();
        authService.changePassword(username, changePasswordRequest);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health() {
        return ResponseEntity.ok(ApiResponse.success("Auth service is running"));
    }

    // Endpoint to clear expired sessions
    @PostMapping("/clear-sessions")
    public ResponseEntity<ApiResponse> clearExpiredSessions() {
        try {
            authService.clearExpiredSessions();
            return ResponseEntity.ok(ApiResponse.success("Expired sessions cleared successfully"));
        } catch (Exception e) {
            logger.error("Failed to clear expired sessions: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to clear sessions"));
        }
    }

    // Force logout endpoint for clearing stuck sessions
    @PostMapping("/force-logout")
    public ResponseEntity<ApiResponse> forceLogout(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            if (username == null || username.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Username is required"));
            }

            logger.info("Force logout requested for user: {}", username);
            authService.logout(username);
            return ResponseEntity.ok(ApiResponse.success("User " + username + " has been forcefully logged out"));
        } catch (Exception e) {
            logger.error("Force logout failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("Force logout failed: " + e.getMessage()));
        }
    }
}