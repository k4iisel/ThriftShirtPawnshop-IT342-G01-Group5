package com.thriftshirt.pawnshop.controller;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.thriftshirt.pawnshop.dto.response.ApiResponse;
import com.thriftshirt.pawnshop.dto.response.PawnRequestResponse;
import com.thriftshirt.pawnshop.dto.response.UserProfileResponse;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.service.AuthService;
import com.thriftshirt.pawnshop.service.PawnRequestService;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    @Autowired
    private AuthService authService;
    
    @Autowired
    private PawnRequestService pawnRequestService;
    
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAdminDashboard(Authentication authentication) {
        logger.info("Admin dashboard accessed by: {}", authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("ADMIN")) {
            logger.warn("Non-admin user attempted to access admin dashboard: {}", authentication.getName());
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Access denied. Admin privileges required."));
        }
        
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard access granted"));
    }
    
    @GetMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserProfileResponse> getAdminProfile(Authentication authentication) {
        logger.info("Admin profile requested by: {}", authentication.getName());
        
        String username = authentication.getName();
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("ADMIN")) {
            logger.warn("Non-admin user attempted to access admin profile: {}", username);
            throw new org.springframework.security.access.AccessDeniedException("Admin access required");
        }
        
        UserProfileResponse adminProfile = authService.getCurrentUser(username);
        return ResponseEntity.ok(adminProfile);
    }
    
    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> adminHealth(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Admin access required"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("Admin service is operational"));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAdminStats(Authentication authentication) {
        logger.info("Admin stats requested by: {}", authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Admin access required"));
        }
        
        return ResponseEntity.ok(ApiResponse.success("Admin stats placeholder - to be implemented"));
    }
    
    // Get all pawn requests (admin only)
    @GetMapping("/pawn-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllPawnRequests(Authentication authentication) {
        logger.info("Admin fetching all pawn requests: {}", authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Admin access required"));
        }
        
        try {
            List<PawnRequestResponse> allRequests = pawnRequestService.getAllPawnRequests();
            return ResponseEntity.ok(ApiResponse.success("Pawn requests retrieved", allRequests));
        } catch (Exception e) {
            logger.error("Error fetching pawn requests: ", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to fetch pawn requests: " + e.getMessage()));
        }
    }
    
    // Update pawn request status (admin only)
    @PutMapping("/pawn-requests/{pawnId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updatePawnRequestStatus(
            @PathVariable Long pawnId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        logger.info("Admin updating pawn request {} status: {}", pawnId, authentication.getName());
        
        User user = (User) authentication.getPrincipal();
        
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403)
                .body(ApiResponse.error("Admin access required"));
        }
        
        try {
            String newStatus = request.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Status is required"));
            }
            
            PawnRequestResponse updated = pawnRequestService.updatePawnRequestStatus(pawnId, newStatus);
            logger.info("Pawn request {} status updated to: {}", pawnId, newStatus);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
        } catch (Exception e) {
            logger.error("Error updating pawn request status: ", e);
            return ResponseEntity.status(500)
                .body(ApiResponse.error("Failed to update status: " + e.getMessage()));
        }
    }
    
    // Public endpoint to create default admin (no auth required for initial setup)
    @PostMapping("/create-default")
    public ResponseEntity<?> createDefaultAdmin() {
        logger.info("Request to create default admin user");
        
        try {
            authService.createDefaultAdmin();
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "Default admin user created successfully", 
                "username", "admin", 
                "password", "tsps2025",
                "note", "Please change the password after first login"
            ));
        } catch (Exception e) {
            logger.error("Failed to create default admin: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage(),
                "details", e.getClass().getSimpleName()
            ));
        }
    }
    
    // Public health check endpoint
    @GetMapping("/test-connection")
    public ResponseEntity<?> testConnection() {
        try {
            return ResponseEntity.ok().body(Map.of(
                "success", true,
                "message", "Backend is running and accessible",
                "timestamp", java.time.LocalDateTime.now().toString()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}