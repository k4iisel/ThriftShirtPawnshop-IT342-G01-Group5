package com.thriftshirt.pawnshop.controller;

import java.math.BigDecimal;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thriftshirt.pawnshop.dto.response.ApiResponse;
import com.thriftshirt.pawnshop.dto.response.PawnRequestResponse;
import com.thriftshirt.pawnshop.dto.response.UserProfileResponse;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.service.AuthService;
import com.thriftshirt.pawnshop.service.PawnRequestService;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private PawnRequestService pawnRequestService;

    @Autowired
    private com.thriftshirt.pawnshop.service.LoanService loanService;

    @Autowired
    private com.thriftshirt.pawnshop.repository.UserRepository userRepository;

    @Autowired
    private com.thriftshirt.pawnshop.repository.LoanRepository loanRepository;

    @Autowired
    private com.thriftshirt.pawnshop.service.TransactionLogService transactionLogService;

    @Autowired
    private com.thriftshirt.pawnshop.service.UserService userService;

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

        // 1. Total Users
        long totalUsers = userRepository.count();

        // 2. Active Loans (Active Pawns)
        long activePawns = loanRepository.countByStatus("ACTIVE");

        // 3. Revenue (System capital available)
        java.math.BigDecimal revenue = loanService.calculateCurrentRevenue();

        Map<String, Object> stats = Map.of(
                "totalUsers", totalUsers,
                "activePawns", activePawns,
                "revenue", revenue);

        return ResponseEntity.ok(ApiResponse.success("Admin stats retrieved", stats));
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

    // Get all inventory items (FORFEITED only)
    @GetMapping("/inventory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getInventoryItems(Authentication authentication) {
        logger.info("Admin fetching inventory (forfeited items only): {}", authentication.getName());

        User user = (User) authentication.getPrincipal();
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            List<PawnRequestResponse> inventory = pawnRequestService.getInventoryItems();
            return ResponseEntity.ok(ApiResponse.success("Inventory retrieved", inventory));
        } catch (Exception e) {
            logger.error("Error fetching inventory: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch inventory: " + e.getMessage()));
        }
    }

    // Get all activity logs (admin only)
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getActivityLogs(Authentication authentication) {
        logger.info("Admin fetching activity logs: {}", authentication.getName());

        User user = (User) authentication.getPrincipal();
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            List<com.thriftshirt.pawnshop.entity.TransactionLog> logs = transactionLogService.getAllLogs();
            return ResponseEntity.ok(ApiResponse.success("Activity logs retrieved", logs));
        } catch (Exception e) {
            logger.error("Error fetching activity logs: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch logs: " + e.getMessage()));
        }
    }

    // Get all users
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllUsers(Authentication authentication) {
        logger.info("Admin fetching all users: {}", authentication.getName());

        User user = (User) authentication.getPrincipal();
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
        } catch (Exception e) {
            logger.error("Error fetching users: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch users: " + e.getMessage()));
        }
    }

    // Toggle User Status (Ban/Unban)
    @PostMapping("/users/{userId}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> toggleUserStatus(@PathVariable Long userId, Authentication authentication) {
        logger.info("Admin toggling status for user {}: {}", userId, authentication.getName());

        User adminUser = (User) authentication.getPrincipal(); // Get logged-in admin
        if (!adminUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            User updatedUser = userService.toggleUserStatus(userId, adminUser); // Pass adminUser for logging
            String status = updatedUser.isEnabled() ? "Unbanned" : "Banned";
            return ResponseEntity.ok(ApiResponse.success("User " + status + " successfully", updatedUser));
        } catch (Exception e) {
            logger.error("Error toggling user status: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to toggle user status: " + e.getMessage()));
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

            PawnRequestResponse updated = pawnRequestService.updatePawnRequestStatus(pawnId, newStatus, user);
            logger.info("Pawn request {} status updated to: {}", pawnId, newStatus);
            return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
        } catch (Exception e) {
            logger.error("Error updating pawn request status: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to update status: " + e.getMessage()));
        }
    }

    // Validate pawn request and create loan (admin only)
    @PostMapping("/pawn-requests/{pawnId}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> validatePawnRequest(
            @PathVariable Long pawnId,
            @RequestParam(required = false, defaultValue = "5") Integer interestRate,
            @RequestParam(required = false, defaultValue = "30") Integer daysUntilDue,
            Authentication authentication) {
        logger.info("Admin validating pawn request {}: {} with interest: {}%, days: {}",
            pawnId, authentication.getName(), interestRate, daysUntilDue);

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Admin access required"));
        }

        try {
            com.thriftshirt.pawnshop.entity.Loan loan = loanService.createLoan(pawnId, interestRate, daysUntilDue);
            return ResponseEntity.ok(ApiResponse.success("Pawn validated and loan created successfully", loan));
        } catch (Exception e) {
            logger.error("Error validating pawn request: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to validate pawn: " + e.getMessage()));
        }
    }

    // Get all active loans (admin only)
    @GetMapping("/loans/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getActiveLoans(Authentication authentication) {
        logger.info("Admin fetching active loans: {}", authentication.getName());

        User user = (User) authentication.getPrincipal();
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            List<com.thriftshirt.pawnshop.entity.Loan> activeLoans = loanService.getAllActiveLoans();
            return ResponseEntity.ok(ApiResponse.success("Active loans retrieved", activeLoans));
        } catch (Exception e) {
            logger.error("Error fetching active loans: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to fetch active loans"));
        }
    }

    // Process loan payment (admin only)
    @PostMapping("/loans/{loanId}/payment")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> processLoanPayment(
            @PathVariable Long loanId,
            Authentication authentication) {
        logger.info("Admin processing payment for loan {}: {}", loanId, authentication.getName());

        User user = (User) authentication.getPrincipal();
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            // Get the loan to find the user ID
            com.thriftshirt.pawnshop.entity.Loan loanToProcess = loanService.getLoanById(loanId);
            Long userId = loanToProcess.getPawnItem().getUser().getId();
            
            com.thriftshirt.pawnshop.entity.Loan loan = loanService.processPayment(loanId, userId);
            return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", loan));
        } catch (Exception e) {
            logger.error("Error processing payment: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to process payment: " + e.getMessage()));
        }
    }

    // Forfeit loan (admin only)
    @PostMapping("/loans/{loanId}/forfeit")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> forfeitLoan(
            @PathVariable Long loanId,
            Authentication authentication) {
        logger.info("Admin forfeiting loan {}: {}", loanId, authentication.getName());

        User user = (User) authentication.getPrincipal();
        if (!user.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            com.thriftshirt.pawnshop.entity.Loan loan = loanService.forfeitLoan(loanId);
            return ResponseEntity.ok(ApiResponse.success("Loan forfeited successfully", loan));
        } catch (Exception e) {
            logger.error("Error forfeiting loan: ", e);
            return ResponseEntity.status(500).body(ApiResponse.error("Failed to forfeit loan: " + e.getMessage()));
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
                    "note", "Please change the password after first login"));
        } catch (Exception e) {
            logger.error("Failed to create default admin: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage(),
                    "details", e.getClass().getSimpleName()));
        }
    }

    // Admin wallet management endpoints
    @PostMapping("/users/{userId}/wallet/add-funds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> addFundsToUserWallet(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount,
            Authentication authentication) {
        logger.info("Admin adding funds to user {} wallet. Amount: {}", userId, amount);

        User adminUser = (User) authentication.getPrincipal();
        if (!adminUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid amount. Amount must be greater than zero."));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new com.thriftshirt.pawnshop.exception.ResourceNotFoundException("User not found"));

            BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
            user.setWalletBalance(currentBalance.add(amount));
            userRepository.save(user);

            // Log the admin action
            com.thriftshirt.pawnshop.entity.TransactionLog log = new com.thriftshirt.pawnshop.entity.TransactionLog();
            log.setUser(adminUser);
            log.setAction("ADMIN_ADD_FUNDS");
            log.setRemarks(String.format("Admin added ₱%.2f to user %s (ID: %d) wallet. New balance: ₱%.2f", 
                    amount.doubleValue(), user.getUsername(), userId, user.getWalletBalance().doubleValue()));
            transactionLogService.logTransaction(log);

            logger.info("Admin successfully added ₱{} to user {} wallet", amount, userId);
            return ResponseEntity.ok(ApiResponse.success("Funds added successfully", 
                    Map.of("userId", userId, "addedAmount", amount, "newBalance", user.getWalletBalance())));
        } catch (Exception e) {
            logger.error("Error adding funds to user wallet: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to add funds: " + e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/wallet/deduct-funds")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deductFundsFromUserWallet(
            @PathVariable Long userId,
            @RequestParam BigDecimal amount,
            Authentication authentication) {
        logger.info("Admin deducting funds from user {} wallet. Amount: {}", userId, amount);

        User adminUser = (User) authentication.getPrincipal();
        if (!adminUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid amount. Amount must be greater than zero."));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new com.thriftshirt.pawnshop.exception.ResourceNotFoundException("User not found"));

            BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
            
            if (currentBalance.compareTo(amount) < 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(String.format(
                                "Insufficient balance. User has ₱%.2f, requested to deduct ₱%.2f", 
                                currentBalance.doubleValue(), amount.doubleValue())));
            }

            user.setWalletBalance(currentBalance.subtract(amount));
            userRepository.save(user);

            // Log the admin action
            com.thriftshirt.pawnshop.entity.TransactionLog log = new com.thriftshirt.pawnshop.entity.TransactionLog();
            log.setUser(adminUser);
            log.setAction("ADMIN_DEDUCT_FUNDS");
            log.setRemarks(String.format("Admin deducted ₱%.2f from user %s (ID: %d) wallet. New balance: ₱%.2f", 
                    amount.doubleValue(), user.getUsername(), userId, user.getWalletBalance().doubleValue()));
            transactionLogService.logTransaction(log);

            logger.info("Admin successfully deducted ₱{} from user {} wallet", amount, userId);
            return ResponseEntity.ok(ApiResponse.success("Funds deducted successfully", 
                    Map.of("userId", userId, "deductedAmount", amount, "newBalance", user.getWalletBalance())));
        } catch (Exception e) {
            logger.error("Error deducting funds from user wallet: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to deduct funds: " + e.getMessage()));
        }
    }

    @GetMapping("/users/{userId}/wallet/balance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getUserWalletBalance(
            @PathVariable Long userId,
            Authentication authentication) {
        logger.info("Admin checking wallet balance for user: {}", userId);

        User adminUser = (User) authentication.getPrincipal();
        if (!adminUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(403).body(ApiResponse.error("Admin access required"));
        }

        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new com.thriftshirt.pawnshop.exception.ResourceNotFoundException("User not found"));

            BigDecimal balance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
            
            return ResponseEntity.ok(ApiResponse.success("Wallet balance retrieved", 
                    Map.of("userId", userId, "username", user.getUsername(), "walletBalance", balance)));
        } catch (Exception e) {
            logger.error("Error getting user wallet balance: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to get wallet balance: " + e.getMessage()));
        }
    }

    // Add cash to user wallet
    @PostMapping("/users/{userId}/add-cash")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> addCashToUser(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        logger.info("Admin adding cash to user {}", userId);

        User admin = (User) authentication.getPrincipal();

        try {
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String reason = request.get("reason") != null ? request.get("reason").toString() : "Cash added by admin";

            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error("Amount must be greater than zero"));
            }

            BigDecimal totalRevenue = loanService.calculateCurrentRevenue();

            // Check if there's enough revenue to add cash
            if (totalRevenue.compareTo(amount) < 0) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error(String.format(
                            "Insufficient revenue! Current revenue: ₱%.2f, Required: ₱%.2f. Need ₱%.2f more.",
                            totalRevenue.doubleValue(), 
                            amount.doubleValue(), 
                            amount.subtract(totalRevenue).doubleValue()
                        )));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new com.thriftshirt.pawnshop.exception.ResourceNotFoundException("User not found"));

            BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
            BigDecimal newBalance = currentBalance.add(amount);
            user.setWalletBalance(newBalance);
            userRepository.save(user);

            // Log transaction
            com.thriftshirt.pawnshop.entity.TransactionLog log = new com.thriftshirt.pawnshop.entity.TransactionLog();
            log.setUser(user);
            log.setAction("ADMIN_ADD_CASH");
            log.setRemarks(String.format("Admin %s added ₱%.2f to wallet. Reason: %s. New balance: ₱%.2f",
                    admin.getUsername(), amount.doubleValue(), reason, newBalance.doubleValue()));
            transactionLogService.logTransaction(log);

            // Log revenue deduction (money given out from system)
            com.thriftshirt.pawnshop.entity.TransactionLog revenueLog = new com.thriftshirt.pawnshop.entity.TransactionLog();
            revenueLog.setUser(user);
            revenueLog.setAction("REVENUE_DEDUCTED_CASH_ADDED");
            revenueLog.setRemarks(String.format("Revenue deducted: ₱%.2f (Cash added to %s by admin). Reason: %s",
                    amount.doubleValue(), user.getUsername(), reason));
            transactionLogService.logTransaction(revenueLog);

            logger.info("✅ Admin {} added ₱{} to user {} wallet. Revenue deducted.", admin.getId(), amount, userId);
            return ResponseEntity.ok(ApiResponse.success("Cash added successfully",
                    Map.of("userId", userId, "newBalance", newBalance, "amountAdded", amount)));
        } catch (NumberFormatException e) {
            logger.error("Invalid amount format: ", e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Invalid amount format"));
        } catch (Exception e) {
            logger.error("Error adding cash to user: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to add cash: " + e.getMessage()));
        }
    }

    // Remove cash from user wallet
    @PostMapping("/users/{userId}/remove-cash")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> removeCashFromUser(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        logger.info("Admin removing cash from user {}", userId);

        User admin = (User) authentication.getPrincipal();

        try {
            BigDecimal amount = new BigDecimal(request.get("amount").toString());
            String reason = request.get("reason") != null ? request.get("reason").toString() : "Cash removed by admin";

            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error("Amount must be greater than zero"));
            }

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new com.thriftshirt.pawnshop.exception.ResourceNotFoundException("User not found"));

            BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;

            if (currentBalance.compareTo(amount) < 0) {
                return ResponseEntity.status(400)
                        .body(ApiResponse.error(String.format("Insufficient balance. Available: ₱%.2f, Requested: ₱%.2f",
                                currentBalance.doubleValue(), amount.doubleValue())));
            }

            BigDecimal totalRevenue = loanService.calculateCurrentRevenue();

            // Removing cash returns funds to revenue pool, no need to check availability

            BigDecimal newBalance = currentBalance.subtract(amount);
            user.setWalletBalance(newBalance);
            userRepository.save(user);

            // Log transaction
            com.thriftshirt.pawnshop.entity.TransactionLog log = new com.thriftshirt.pawnshop.entity.TransactionLog();
            log.setUser(user);
            log.setAction("ADMIN_REMOVE_CASH");
            log.setRemarks(String.format("Admin %s removed ₱%.2f from wallet. Reason: %s. New balance: ₱%.2f",
                    admin.getUsername(), amount.doubleValue(), reason, newBalance.doubleValue()));
            transactionLogService.logTransaction(log);

            // Log revenue increase (money taken back into system)
            com.thriftshirt.pawnshop.entity.TransactionLog revenueLog = new com.thriftshirt.pawnshop.entity.TransactionLog();
            revenueLog.setUser(user);
            revenueLog.setAction("REVENUE_EARNED_CASH_REMOVED");
            revenueLog.setRemarks(String.format("Revenue earned: ₱%.2f (Cash removed from %s by admin). Reason: %s",
                    amount.doubleValue(), user.getUsername(), reason));
            transactionLogService.logTransaction(revenueLog);

            logger.info("✅ Admin {} removed ₱{} from user {} wallet. Revenue increased.", admin.getId(), amount, userId);
            return ResponseEntity.ok(ApiResponse.success("Cash removed successfully",
                    Map.of("userId", userId, "newBalance", newBalance, "amountRemoved", amount)));
        } catch (NumberFormatException e) {
            logger.error("Invalid amount format: ", e);
            return ResponseEntity.status(400)
                    .body(ApiResponse.error("Invalid amount format"));
        } catch (Exception e) {
            logger.error("Error removing cash from user: ", e);
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to remove cash: " + e.getMessage()));
        }
    }

    // Public health check endpoint
    @GetMapping("/test-connection")
    public ResponseEntity<?> testConnection() {
        try {
            return ResponseEntity.ok().body(Map.of(
                    "success", true,
                    "message", "Backend is running and accessible",
                    "timestamp", java.time.LocalDateTime.now().toString()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", e.getMessage()));
        }
    }
}