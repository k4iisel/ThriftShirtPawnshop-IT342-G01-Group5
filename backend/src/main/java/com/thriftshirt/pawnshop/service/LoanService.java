package com.thriftshirt.pawnshop.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thriftshirt.pawnshop.entity.Loan;
import com.thriftshirt.pawnshop.entity.PawnRequest;
import com.thriftshirt.pawnshop.entity.TransactionLog;
import com.thriftshirt.pawnshop.entity.User;
import com.thriftshirt.pawnshop.exception.BadRequestException;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.LoanRepository;
import com.thriftshirt.pawnshop.repository.PawnRequestRepository;
import com.thriftshirt.pawnshop.repository.UserRepository;

@Service
@Transactional
public class LoanService {

    private static final Logger logger = LoggerFactory.getLogger(LoanService.class);
    private static final BigDecimal BASE_CAPITAL = new BigDecimal("1000");
    private static final BigDecimal FORFEIT_MARKUP = new BigDecimal("1.05");
    private static final BigDecimal INTEREST_RATE = new BigDecimal("0.05");
    private static final Pattern PESO_AMOUNT_PATTERN = Pattern.compile("₱\\s*([0-9]+(?:\\.[0-9]+)?)");

    @Autowired
    private PawnRequestRepository pawnRequestRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private TransactionLogService transactionLogService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get loan by ID
     */
    public Loan getLoanById(Long loanId) {
        return loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
    }

    /**
     * Create a loan from an approved pawn request with default terms
     */
    public Loan createLoan(Long pawnId) {
        return createLoan(pawnId, 5, 30); // Default: 5% interest, 30 days
    }

    /**
     * Create a loan from an approved pawn request with custom terms
     */
    public Loan createLoan(Long pawnId, Integer interestRate, Integer daysUntilDue) {
        if (interestRate == null) interestRate = 5;
        if (daysUntilDue == null) daysUntilDue = 30;
        
        logger.info("Creating loan for pawn request ID: {} with {}% interest and {} days", pawnId, interestRate, daysUntilDue);

        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
                .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));

        // Check if loan already exists and is active
        if (pawnRequest.getLoan() != null && "PAWNED".equals(pawnRequest.getStatus())) {
            logger.info("Loan already exists for pawn ID: {}. Returning existing loan.", pawnId);
            return pawnRequest.getLoan();
        }

        // Validate status
        if (!"APPROVED".equals(pawnRequest.getStatus())) {
            throw new BadRequestException(
                    "Cannot create loan. Pawn request status must be APPROVED, but is: " + pawnRequest.getStatus());
        }

        // Check if there's an existing loan
        Loan existingLoan = pawnRequest.getLoan();
        boolean isRenewal = existingLoan != null && "PAID".equals(existingLoan.getStatus());
        
        // If there's an active loan (not paid), throw error
        if (existingLoan != null && !"PAID".equals(existingLoan.getStatus())) {
            throw new BadRequestException("An active loan already exists for this pawn request");
        }

        // Create or reuse loan
        Loan loan;
        if (isRenewal) {
            // Reuse existing loan for renewal
            loan = existingLoan;
            if (loan != null) {
                logger.info("Renewing existing loan ID: {} for pawn ID: {}", loan.getLoanId(), pawnId);
            }
        } else {
            // Create new loan
            loan = new Loan();
            loan.setPawnItem(pawnRequest);
        }

        Double loanAmountDouble = pawnRequest.getEstimatedValue() != null ? pawnRequest.getEstimatedValue()
                : pawnRequest.getLoanAmount();

        if (loanAmountDouble == null) {
            throw new BadRequestException("Cannot create loan: No amount value found");
        }

        BigDecimal loanAmount = BigDecimal.valueOf(loanAmountDouble);

        BigDecimal totalRevenue = calculateCurrentRevenue();

        // Check if there's enough revenue to release this loan
        if (totalRevenue.compareTo(loanAmount) < 0) {
            throw new BadRequestException(String.format(
                "Insufficient funds! Current revenue: ₱%.2f, Required: ₱%.2f. Need ₱%.2f more.",
                totalRevenue.doubleValue(), 
                loanAmount.doubleValue(), 
                loanAmount.subtract(totalRevenue).doubleValue()
            ));
        }

        loan.setLoanAmount(loanAmount);

        // Set loan terms
        loan.setInterestRate(interestRate);
        loan.setDueDate(LocalDate.now().plusDays(daysUntilDue));
        loan.setStatus("ACTIVE");
        loan.setPenalty(BigDecimal.ZERO);
        loan.setDateRedeemed(null); // Clear redemption date for renewals

        // Setup bidirectional relationship
        pawnRequest.setLoan(loan);
        pawnRequest.setStatus("PAWNED");

        // Add loan amount to user's wallet
        User user = pawnRequest.getUser();
        BigDecimal currentWalletBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        user.setWalletBalance(currentWalletBalance.add(loan.getLoanAmount()));
        userRepository.save(user);
        
        logger.info("💰 Added ₱{} to user {}'s wallet. New balance: ₱{}", 
            loan.getLoanAmount(), user.getId(), user.getWalletBalance());

        // Save via PawnRequest (cascades to Loan)
        pawnRequest = pawnRequestRepository.save(pawnRequest);
        Loan savedLoan = pawnRequest.getLoan();

        logger.info("✅ Loan created successfully. Loan ID: {}, Pawn ID: {}", savedLoan.getLoanId(), pawnId);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawnRequest.getUser());
        log.setAction("LOAN_CREATED");
        log.setRemarks(String.format("Loan created for item: %s (ID: %d). Status: PAWNED. ₱%.2f added to wallet. Interest: %d%%, Due in %d days. New wallet balance: ₱%.2f", 
            pawnRequest.getItemName(), pawnId, loan.getLoanAmount().doubleValue(), interestRate, daysUntilDue, user.getWalletBalance().doubleValue()));
        log.setCondition(pawnRequest.getCondition());
        log.setPhotos(pawnRequest.getPhotos());
        transactionLogService.logTransaction(log);

        return savedLoan;
    }

    /**
     * Get all active loans
     */
    public List<Loan> getAllActiveLoans() {
        return loanRepository.findAll().stream()
                .filter(loan -> "ACTIVE".equals(loan.getStatus()))
                .collect(Collectors.toList());
    }

    public BigDecimal calculateCurrentRevenue() {
        List<PawnRequest> allRequests = pawnRequestRepository.findAll();
        List<TransactionLog> allLogs = transactionLogService.getAllLogs();
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (PawnRequest req : allRequests) {
            BigDecimal amount = getLoanAmountOrZero(req);
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            String status = req.getStatus();
            if (status == null) {
                continue;
            }

            switch (status) {
                case "FORFEITED":
                    // Shop keeps the item and gains 5% markup based on loan amount
                    totalRevenue = totalRevenue.add(amount.multiply(FORFEIT_MARKUP));
                    break;
                case "REDEEMED":
                    // Customer repays the loan plus interest, returning principal to the pool
                    totalRevenue = totalRevenue.add(amount); // principal returned
                    totalRevenue = totalRevenue.add(amount.multiply(INTEREST_RATE)); // interest earned
                    break;
                case "PAWNED":
                case "ACTIVE":
                    // Funds currently out in an active loan
                    totalRevenue = totalRevenue.subtract(amount);
                    break;
                default:
                    break;
            }
        }

        for (TransactionLog log : allLogs) {
            String action = log.getAction();
            BigDecimal amount = extractAmountFromRemarks(log.getRemarks());

            if (amount.compareTo(BigDecimal.ZERO) <= 0 || action == null) {
                continue;
            }

            switch (action) {
                case "REVENUE_EARNED_CASH_REMOVED":
                case "REVENUE_EARNED_REDEMPTION":
                    totalRevenue = totalRevenue.add(amount);
                    break;
                case "REVENUE_DEDUCTED_CASH_ADDED":
                    totalRevenue = totalRevenue.subtract(amount);
                    break;
                default:
                    break;
            }
        }

        return totalRevenue.add(BASE_CAPITAL);
    }

    private BigDecimal getLoanAmountOrZero(PawnRequest req) {
        Double amount = req.getLoanAmount() != null ? req.getLoanAmount() : req.getEstimatedValue();
        if (amount == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(amount);
    }

    private BigDecimal extractAmountFromRemarks(String remarks) {
        if (remarks == null) {
            return BigDecimal.ZERO;
        }

        Matcher matcher = PESO_AMOUNT_PATTERN.matcher(remarks);
        if (matcher.find()) {
            try {
                return new BigDecimal(matcher.group(1));
            } catch (NumberFormatException ex) {
                logger.warn("Failed to parse amount from remarks: {}", remarks, ex);
            }
        }
        return BigDecimal.ZERO;
    }

    /**
     * Process loan payment (Redeem item)
     */
    public Loan processPayment(Long loanId, Long userId) {
        logger.info("Processing payment for loan ID: {} by user: {}", loanId, userId);

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        if (!"ACTIVE".equals(loan.getStatus())) {
            throw new BadRequestException("Loan is not active. Current status: " + loan.getStatus());
        }

        // Get user and validate ownership
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        PawnRequest pawn = loan.getPawnItem();
        if (!pawn.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only redeem your own items");
        }

        // Calculate total redeem amount (loan + 5% interest + penalty)
        BigDecimal totalRedeemAmount = loan.calculateTotalRedeemAmount();
        BigDecimal userWalletBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;

        // Auto-sync wallet if empty but has active loans (for backward compatibility)
        if (userWalletBalance.compareTo(BigDecimal.ZERO) == 0) {
            List<Loan> userActiveLoans = loanRepository.findAll().stream()
                .filter(l -> "ACTIVE".equals(l.getStatus()))
                .filter(l -> l.getPawnItem().getUser().getId().equals(userId))
                .collect(Collectors.toList());
            
            if (!userActiveLoans.isEmpty()) {
                BigDecimal totalLoanAmount = userActiveLoans.stream()
                    .map(Loan::getLoanAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                user.setWalletBalance(totalLoanAmount);
                userRepository.save(user);
                userWalletBalance = totalLoanAmount;
                logger.info("💰 Auto-synced wallet for user {}. Added ₱{} from {} active loan(s)", 
                    userId, totalLoanAmount, userActiveLoans.size());
            }
        }

        // Validate wallet balance
        if (userWalletBalance.compareTo(totalRedeemAmount) < 0) {
            throw new BadRequestException(String.format(
                "Insufficient balance. Required: ₱%.2f, Available: ₱%.2f", 
                totalRedeemAmount.doubleValue(), userWalletBalance.doubleValue()
            ));
        }

        // Deduct amount from wallet
        user.setWalletBalance(userWalletBalance.subtract(totalRedeemAmount));
        userRepository.save(user);

        // Update Loan
        loan.setStatus("PAID");
        loan.setDateRedeemed(LocalDate.now());

        // Update Pawn Item
        pawn.setStatus("REDEEMED");

        loanRepository.save(loan);
        pawnRequestRepository.save(pawn); // Explicitly save parent to ensure sync

        // Calculate revenue earned (5% interest)
        BigDecimal interestEarned = loan.getLoanAmount().multiply(BigDecimal.valueOf(0.05));
        
        logger.info("✅ Loan {} paid and item redeemed. Amount deducted: ₱{}, Revenue earned: ₱{}", 
            loanId, totalRedeemAmount, interestEarned);

        // Log transaction for user
        TransactionLog log = new TransactionLog();
        log.setUser(pawn.getUser());
        log.setAction("LOAN_PAID");
        log.setRemarks(String.format("Loan %d paid (₱%.2f deducted from wallet). Item %s redeemed. Interest earned: ₱%.2f", 
                loanId, totalRedeemAmount.doubleValue(), pawn.getItemName(), interestEarned.doubleValue()));
        log.setCondition(pawn.getCondition());
        transactionLogService.logTransaction(log);

        // Log admin revenue transaction
        TransactionLog adminLog = new TransactionLog();
        adminLog.setUser(pawn.getUser()); // Track which user's redemption generated this revenue
        adminLog.setAction("REVENUE_EARNED_REDEMPTION");
        adminLog.setRemarks(String.format("Revenue earned from loan redemption: ₱%.2f (5%% interest on ₱%.2f). Item: %s (Loan ID: %d)", 
                interestEarned.doubleValue(), loan.getLoanAmount().doubleValue(), pawn.getItemName(), loanId));
        adminLog.setCondition(pawn.getCondition());
        transactionLogService.logTransaction(adminLog);

        return loan;
    }

    /**
     * Forfeit loan (Default on item)
     */
    public Loan forfeitLoan(Long loanId) {
        logger.info("Forfeiting loan ID: {}", loanId);

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        if (!"ACTIVE".equals(loan.getStatus())) {
            throw new BadRequestException("Loan is not active. Current status: " + loan.getStatus());
        }

        // Update Loan
        loan.setStatus("DEFAULTED");

        // Update Pawn Item
        PawnRequest pawn = loan.getPawnItem();
        pawn.setStatus("FORFEITED");

        loanRepository.save(loan);
        pawnRequestRepository.save(pawn);

        logger.info("⛔ Loan {} forfeited", loanId);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawn.getUser());
        log.setAction("LOAN_FORFEITED");
        log.setRemarks("Loan " + loanId + " forfeited. Item " + pawn.getItemName() + " moved to inventory.");
        log.setCondition(pawn.getCondition());
        transactionLogService.logTransaction(log);

        return loan;
    }

    /**
     * Get loans by user
     */
    public List<Loan> getUserLoans(Long userId) {
        logger.info("Getting loans for user ID: {}", userId);
        return loanRepository.findAll().stream()
                .filter(loan -> loan.getPawnItem().getUser().getId().equals(userId))
                .collect(Collectors.toList());
    }

    /**
     * Renew loan for redeemed items (change status back to PENDING for admin approval)
     */
    public Loan renewLoan(Long pawnId) {
        logger.info("Renewing loan for pawn ID: {}", pawnId);

        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
                .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));

        // Check if item is already pending (idempotent behavior)
        if ("PENDING".equals(pawnRequest.getStatus())) {
            logger.info("✅ Pawn ID: {} is already PENDING for admin approval", pawnId);
            return pawnRequest.getLoan();
        }

        // Check if item is redeemed and can be renewed
        if (!"REDEEMED".equals(pawnRequest.getStatus())) {
            throw new BadRequestException("Loans can only be renewed for redeemed items. Current status: " + pawnRequest.getStatus());
        }

        // Get the existing loan for this pawn item
        Loan existingLoan = pawnRequest.getLoan();
        if (existingLoan == null) {
            throw new BadRequestException("No existing loan found for this pawn item");
        }

        // Change pawn request status to PENDING so admin can review and approve it again
        pawnRequest.setStatus("PENDING");

        // Keep the loan in PAID status
        // Admin will review the renewal request, approve it, and then validate/create the new loan

        // Save the pawn request
        pawnRequestRepository.save(pawnRequest);

        logger.info("✅ Loan renewal requested. Pawn ID: {} status changed to PENDING for admin approval", pawnId);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawnRequest.getUser());
        log.setAction("LOAN_RENEWAL_REQUESTED");
        log.setRemarks("Loan renewal requested for previously redeemed item: " + pawnRequest.getItemName() + " (Pawn ID: " + pawnId + "). Status changed to PENDING, awaiting admin approval.");
        log.setCondition(pawnRequest.getCondition());
        transactionLogService.logTransaction(log);

        return existingLoan;

    }

    /**
     * Verify loan ownership by user
     */
    public boolean isLoanOwnedByUser(Long loanId, Long userId) {
        try {
            Loan loan = loanRepository.findById(loanId)
                    .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));
            return loan.getPawnItem().getUser().getId().equals(userId);
        } catch (Exception e) {
            return false;
        }
    }
}
