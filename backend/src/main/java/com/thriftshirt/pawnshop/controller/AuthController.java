package com.thriftshirt.pawnshop.controller;

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
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        logger.info("Registration attempt for username: {}", registerRequest.getUsername());
        try {
            AuthResponse authResponse = authService.register(registerRequest);
            logger.info("Registration successful for username: {}", registerRequest.getUsername());
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            logger.error("Registration failed for username: {} - Error: {}", registerRequest.getUsername(), e.getMessage());
            throw e;
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout() {
        // In JWT, logout is handled client-side by removing the token
        // Here we can add token blacklisting if needed in the future
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
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
}