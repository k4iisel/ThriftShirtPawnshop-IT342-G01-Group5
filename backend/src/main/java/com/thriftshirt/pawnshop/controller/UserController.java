package com.thriftshirt.pawnshop.controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.thriftshirt.pawnshop.dto.request.CreatePawnRequestDTO;
import com.thriftshirt.pawnshop.dto.response.ApiResponse;
import com.thriftshirt.pawnshop.dto.response.UserProfileResponse;
import com.thriftshirt.pawnshop.entity.TransactionLog;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.service.AuthService;
import com.thriftshirt.pawnshop.service.LoanService;
import com.thriftshirt.pawnshop.service.PawnRequestService;
import com.thriftshirt.pawnshop.service.TransactionLogService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
@PreAuthorize("hasRole('USER')")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private AuthService authService;

    @Autowired
    private PawnRequestService pawnRequestService;

    @Autowired
    private LoanService loanService;

    @Autowired
    private TransactionLogService transactionLogService;

    @Autowired
    private com.thriftshirt.pawnshop.service.UserService userService;

    @Autowired
    private com.thriftshirt.pawnshop.repository.UserRepository userRepository;

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

        try {
            var stats = pawnRequestService.getUserDashboardStats(user.getId());
            return ResponseEntity.ok(ApiResponse.success("User stats retrieved successfully", stats));
        } catch (Exception e) {
            logger.error("Error retrieving user stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user stats"));
        }
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

    @DeleteMapping("/pawn-requests/{pawnId}")
    public ResponseEntity<ApiResponse> deletePawnRequest(
            @PathVariable Long pawnId,
            Authentication authentication) {
        logger.info("Pawn request deletion initiated for ID: {} by user: {}", pawnId, authentication.getName());

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to delete pawn request: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            pawnRequestService.deletePawnRequest(pawnId, user.getId());
            logger.info("Pawn request {} deleted successfully by user: {}", pawnId, user.getId());
            return ResponseEntity.ok(ApiResponse.success("Pawn request deleted successfully"));
        } catch (Exception e) {
            logger.error("Error deleting pawn request: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to delete pawn request: " + e.getMessage()));
        }
    }

    @PostMapping("/loans/{pawnId}/redeem")
    public ResponseEntity<ApiResponse> redeemLoan(
            @PathVariable Long pawnId,
            Authentication authentication) {
        logger.info("User redeem loan initiated for pawn ID: {} by user: {}", pawnId, authentication.getName());

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to redeem loan: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            // Find the associated loan
            List<com.thriftshirt.pawnshop.entity.Loan> userLoans = loanService.getUserLoans(user.getId());
            com.thriftshirt.pawnshop.entity.Loan targetLoan = userLoans.stream()
                    .filter(loan -> loan.getPawnItem().getPawnId().equals(pawnId))
                    .findFirst()
                    .orElseThrow(() -> new com.thriftshirt.pawnshop.exception.ResourceNotFoundException("No active loan found for this pawn item"));
            
            com.thriftshirt.pawnshop.entity.Loan loan = loanService.processPayment(targetLoan.getLoanId(), user.getId());
            
            logger.info("Loan {} redeemed successfully by user: {}", targetLoan.getLoanId(), user.getId());
            return ResponseEntity.ok(ApiResponse.success("Loan redeemed successfully", loan));
        } catch (Exception e) {
            logger.error("Error redeeming loan: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to redeem loan: " + e.getMessage()));
        }
    }

    @PostMapping("/loans/{pawnId}/renew")
    public ResponseEntity<ApiResponse> renewLoan(
            @PathVariable Long pawnId,
            Authentication authentication) {
        logger.info("User renew loan initiated for pawn ID: {} by user: {}", pawnId, authentication.getName());

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to renew loan: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            // Create new loan for redeemed pawn item
            com.thriftshirt.pawnshop.entity.Loan newLoan = loanService.renewLoan(pawnId);
            logger.info("New loan {} created successfully by user: {}", newLoan.getLoanId(), user.getId());
            return ResponseEntity.ok(ApiResponse.success("New loan created successfully", newLoan));
        } catch (Exception e) {
            logger.error("Error renewing loan: ", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Failed to renew loan: " + e.getMessage()));
        }
    }

    @GetMapping("/loans")
    public ResponseEntity<ApiResponse> getUserLoans(Authentication authentication) {
        logger.info("User loans requested by: {}", authentication.getName());

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to retrieve loans: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            // Get user's pawned items with loans
            var pawnedItems = pawnRequestService.getUserPawnRequests(user.getId())
                    .stream()
                    .filter(pawn -> "PAWNED".equals(pawn.getStatus()))
                    .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success("User loans retrieved successfully", pawnedItems));
        } catch (Exception e) {
            logger.error("Error retrieving user loans: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve loans"));
        }
    }

    @GetMapping("/transaction-history")
    public ResponseEntity<ApiResponse> getUserTransactionHistory(Authentication authentication) {
        logger.info("User transaction history requested by: {}", authentication.getName());

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to retrieve transaction history: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            List<TransactionLog> userLogs = transactionLogService.getUserLogs(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Transaction history retrieved successfully", userLogs));
        } catch (Exception e) {
            logger.error("Error retrieving transaction history: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve transaction history"));
        }
    }

    @DeleteMapping("/transaction-history/{logId}")
    public ResponseEntity<ApiResponse> deleteTransactionLog(
            @PathVariable Long logId,
            Authentication authentication) {
        logger.info("Delete transaction log requested by: {} for logId: {}", authentication.getName(), logId);

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to delete transaction log: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            boolean deleted = transactionLogService.deleteUserTransactionLog(user.getId(), logId);
            
            if (deleted) {
                return ResponseEntity.ok(ApiResponse.success("Transaction log deleted successfully", null));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Transaction log not found"));
            }
        } catch (Exception e) {
            logger.error("Error deleting transaction log: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete transaction log"));
        }
    }

    @DeleteMapping("/transaction-history")
    public ResponseEntity<ApiResponse> clearTransactionHistory(Authentication authentication) {
        logger.info("Clear transaction history requested by: {}", authentication.getName());

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to clear transaction history: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            transactionLogService.clearUserTransactionHistory(user.getId());
            return ResponseEntity.ok(ApiResponse.success("Transaction history cleared successfully", null));
        } catch (Exception e) {
            logger.error("Error clearing transaction history: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to clear transaction history"));
        }
    }

    @PostMapping("/wallet/cash-in")
    public ResponseEntity<ApiResponse> cashIn(
            @RequestParam BigDecimal amount,
            Authentication authentication) {
        logger.info("Cash in requested by: {} for amount: {}", authentication.getName(), amount);

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to cash in: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid amount. Amount must be greater than zero."));
            }

            BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
            user.setWalletBalance(currentBalance.add(amount));
            userService.saveUser(user);

            logger.info("Cash in successful for user: {}. Amount: ₱{}", user.getId(), amount);
            return ResponseEntity.ok(ApiResponse.success("Cash in successful", 
                Map.of("newBalance", user.getWalletBalance(), "addedAmount", amount)));
        } catch (Exception e) {
            logger.error("Error processing cash in: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process cash in: " + e.getMessage()));
        }
    }

    @PostMapping("/wallet/cash-out")
    public ResponseEntity<ApiResponse> cashOut(
            @RequestParam BigDecimal amount,
            Authentication authentication) {
        logger.info("Cash out requested by: {} for amount: {}", authentication.getName(), amount);

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to cash out: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Invalid amount. Amount must be greater than zero."));
            }

            BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
            
            if (currentBalance.compareTo(amount) < 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(String.format(
                            "Insufficient balance. Available: ₱%.2f, Requested: ₱%.2f", 
                            currentBalance.doubleValue(), amount.doubleValue())));
            }

            user.setWalletBalance(currentBalance.subtract(amount));
            userService.saveUser(user);

            logger.info("Cash out successful for user: {}. Amount: ₱{}", user.getId(), amount);
            return ResponseEntity.ok(ApiResponse.success("Cash out successful", 
                Map.of("newBalance", user.getWalletBalance(), "withdrawnAmount", amount)));
        } catch (Exception e) {
            logger.error("Error processing cash out: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process cash out: " + e.getMessage()));
        }
    }

    @GetMapping("/wallet/balance")
    public ResponseEntity<ApiResponse> getWalletBalance(Authentication authentication) {
        logger.info("Wallet balance requested by: {}", authentication.getName());

        User user = (User) authentication.getPrincipal();

        if (!user.getRole().name().equals("USER")) {
            logger.warn("Non-user attempted to get wallet balance: {}", authentication.getName());
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("User privileges required"));
        }

        try {
            // Refresh user from database to get latest balance
            User refreshedUser = userRepository.findById(user.getId())
                    .orElseThrow(() -> new com.thriftshirt.pawnshop.exception.ResourceNotFoundException("User not found"));
            BigDecimal balance = refreshedUser.getWalletBalance() != null ? refreshedUser.getWalletBalance() : BigDecimal.ZERO;
            
            logger.info("Wallet balance retrieved for user {}: ₱{}", user.getId(), balance);
            return ResponseEntity.ok(ApiResponse.success("Wallet balance retrieved", 
                Map.of("balance", balance)));
        } catch (Exception e) {
            logger.error("Error retrieving wallet balance: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve wallet balance: " + e.getMessage()));
        }
    }


}