package com.thriftshirt.pawnshop.controller;

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
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        return ResponseEntity.ok(authResponse);
    }
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        AuthResponse authResponse = authService.register(registerRequest);
        return ResponseEntity.ok(authResponse);
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