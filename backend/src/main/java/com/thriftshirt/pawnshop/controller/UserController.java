package com.thriftshirt.pawnshop.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import com.thriftshirt.pawnshop.dto.request.CreatePawnRequestDTO;
import com.thriftshirt.pawnshop.dto.response.ApiResponse;
import com.thriftshirt.pawnshop.dto.response.UserProfileResponse;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.service.AuthService;
import com.thriftshirt.pawnshop.service.PawnRequestService;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@PreAuthorize("hasRole('USER')")
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private PawnRequestService pawnRequestService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> getUserDashboard(Authentication authentication) {
        logger.info("User dashboard accessed by: {}", authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to access user dashboard: {}", authentication.getName());
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Access denied. User privileges required."));
        }
        
        return ResponseEntity.ok(ApiResponse.success("User dashboard access granted"));
    }
    
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication) {
        logger.info("User profile requested by: {}", authentication.getName());
        
        String username = authentication.getName();
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to access user profile: {}", username);
            return ResponseEntity.status(403)
                .body(null);
        }
        
        UserProfileResponse userProfile = authService.getCurrentUser(username);
        return ResponseEntity.ok(userProfile);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getUserStats(Authentication authentication) {
        logger.info("User stats requested by: {}", authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("USER")) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("User access required"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("User stats - placeholder implementation"));
    }
    
    @PostMapping("/pawn-requests")
    public ResponseEntity<ApiResponse> createPawnRequest(
            @Valid @RequestBody CreatePawnRequestDTO requestDTO,
            Authentication authentication) {
        logger.info("Pawn request creation initiated by: {}", authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to create pawn request: {}", authentication.getName());
            return ResponseEntity.status(403)
                .body(ApiResponse.error("User privileges required to create pawn requests"));
        }
        
        try {
            var response = pawnRequestService.createPawnRequest(user.getId(), requestDTO);
            logger.info("Pawn request created successfully for user: {}", user.getId());
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Pawn request created successfully", response));
        } catch (Exception e) {
            logger.error("Error creating pawn request: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error("Failed to create pawn request: " + e.getMessage()));
        }
    }
    
    @GetMapping("/pawn-requests")
    public ResponseEntity<ApiResponse> getUserPawnRequests(Authentication authentication) {
        logger.info("User pawn requests retrieved by: {}", authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to retrieve pawn requests: {}", authentication.getName());
            return ResponseEntity.status(403)
                .body(ApiResponse.error("User privileges required"));
        }
        
        try {
            var requests = pawnRequestService.getUserPawnRequests(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Pawn requests retrieved successfully", requests));
        } catch (Exception e) {
            logger.error("Error retrieving pawn requests: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve pawn requests"));
        }
    }
}