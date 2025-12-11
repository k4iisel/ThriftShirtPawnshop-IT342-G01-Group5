package com.thriftshirt.pawnshop.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thriftshirt.pawnshop.entity.Loan;
import com.thriftshirt.pawnshop.entity.PawnRequest;
import com.thriftshirt.pawnshop.entity.TransactionLog;
import com.thriftshirt.pawnshop.exception.BadRequestException;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.LoanRepository;
import com.thriftshirt.pawnshop.repository.PawnRequestRepository;

@Service
@Transactional
public class LoanService {

    private static final Logger logger = LoggerFactory.getLogger(LoanService.class);
    // Unused constants removed

    @Autowired
    private PawnRequestRepository pawnRequestRepository;

    @Autowired
    private LoanRepository loanRepository;

    @Autowired
    private TransactionLogService transactionLogService;

    @Autowired
    private NotificationService notificationService;

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
        if (interestRate == null)
            interestRate = 5;
        if (daysUntilDue == null)
            daysUntilDue = 30;

        logger.info("Creating loan for pawn request ID: {} with {}% interest and {} days", pawnId, interestRate,
                daysUntilDue);

        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
                .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));

        // Check if loan already exists and is active
        if (pawnRequest.getLoan() != null && "PAWNED".equals(pawnRequest.getStatus())) {
            logger.info("Loan already exists for pawn ID: {}. Returning existing loan.", pawnId);
            return pawnRequest.getLoan();
        }

        // Validate status - Must be ACCEPTED (User accepted the offer) or ITEM_VERIFIED
        // For now, let's assume valid flow is ACCEPTED -> VALIDATE (which calls this)
        // -> ACTIVE/PAWNED
        // Actually, AdminController calls validatePawnRequest which calls this.
        // We should check if status is "ACCEPTED" or "OFFER_ACCEPTED"
        if (!"ACCEPTED".equals(pawnRequest.getStatus()) && !"OFFER_ACCEPTED".equals(pawnRequest.getStatus())) {
            // For backward compatibility or testing, maybe allow "APPROVED" too if strictly
            // needed, but let's stick to new flow.
            // If we really want to enforce "Face to Face", this happens when Admin clicks
            // "Validate & Pay".
            // So the status before this should be "ACCEPTED".
            throw new BadRequestException(
                    "Cannot create loan. Pawn request status must be ACCEPTED by user, but is: "
                            + pawnRequest.getStatus());
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

        // Use Agreed/Offered Amount
        BigDecimal loanAmount = pawnRequest.getOfferedAmount();

        if (loanAmount == null) {
            throw new BadRequestException("Cannot create loan: No offered amount found. Admin must assess first.");
        }

        // Revenue check (Optional: removed for simplicity as requested "remove scan for
        // other things not needed")
        // But keeping it safer to return just warning if needed, but let's remove
        // revenue check for now to simplify.

        loan.setLoanAmount(loanAmount);

        // Set loan terms
        loan.setInterestRate(interestRate);
        loan.setDueDate(LocalDate.now().plusDays(daysUntilDue));
        loan.setStatus("ACTIVE");
        loan.setPenalty(BigDecimal.ZERO);
        loan.setDateRedeemed(null); // Clear redemption date for renewals

        // Setup bidirectional relationship
        pawnRequest.setLoan(loan);
        pawnRequest.setStatus("ACTIVE"); // "ACTIVE" means cash given/loan active.

        // Remove Wallet Logic - No adding to wallet. Cash is given face to face.

        // Wallet Update Removed - Cash is given Face-to-Face

        // Save via PawnRequest (cascades to Loan)
        pawnRequest = pawnRequestRepository.save(pawnRequest);
        Loan savedLoan = pawnRequest.getLoan();

        logger.info("✅ Loan created successfully. Loan ID: {}, Pawn ID: {}", savedLoan.getLoanId(), pawnId);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawnRequest.getUser());
        log.setAction("LOAN_CREATED");
        log.setRemarks(String.format(
                "Loan created for item: %s (ID: %d). Status: PAWNED. Cash Payout: ₱%.2f. Interest: %d%%, Due in %d days.",
                pawnRequest.getItemName(), pawnId, loan.getLoanAmount().doubleValue(), interestRate, daysUntilDue));
        log.setCondition(pawnRequest.getCondition());
        log.setPhotos(pawnRequest.getPhotos());
        transactionLogService.logTransaction(log);

        // Notify User
        notificationService.createNotification(
                pawnRequest.getUser().getId(),
                "Loan activated for " + pawnRequest.getItemName() + ". Cash payout: ₱" + loan.getLoanAmount()
                        + ". Due date: " + loan.getDueDate(),
                "SUCCESS");

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
        // Calculate Real Revenue (Profit) from Paid Loans (Interest Only)
        List<Loan> paidLoans = loanRepository.findAll().stream()
                .filter(loan -> "PAID".equals(loan.getStatus()))
                .collect(Collectors.toList());

        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Loan loan : paidLoans) {
            // Calculate Gross Revenue: Principal + Interest (Total Redemption Amount)
            // User Definition: "Total income... before any costs are deducted"
            BigDecimal amount = loan.calculateTotalRedeemAmount();
            totalRevenue = totalRevenue.add(amount);
        }

        return totalRevenue;
    }

    // unused methods removed

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

        PawnRequest pawn = loan.getPawnItem();
        if (!pawn.getUser().getId().equals(userId)) {
            throw new BadRequestException("You can only redeem your own items");
        }

        // Calculate total redeem amount (loan + 5% interest + penalty)
        BigDecimal totalRedeemAmount = loan.calculateTotalRedeemAmount();
        // Wallet Deduction Removed - Cash Payment Face-to-Face
        logger.info("Processing Face-to-Face Redemption Payment");

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
        log.setRemarks(
                String.format("Loan %d paid (Cash). Item %s redeemed. Interest earned: ₱%.2f",
                        loanId, pawn.getItemName(), interestEarned.doubleValue()));
        log.setCondition(pawn.getCondition());
        transactionLogService.logTransaction(log);

        // Log admin revenue transaction
        TransactionLog adminLog = new TransactionLog();
        adminLog.setUser(pawn.getUser()); // Track which user's redemption generated this revenue
        adminLog.setAction("REVENUE_EARNED_REDEMPTION");
        adminLog.setRemarks(String.format(
                "Revenue earned from loan redemption: ₱%.2f (5%% interest on ₱%.2f). Item: %s (Loan ID: %d)",
                interestEarned.doubleValue(), loan.getLoanAmount().doubleValue(), pawn.getItemName(), loanId));
        adminLog.setCondition(pawn.getCondition());
        transactionLogService.logTransaction(adminLog);

        // Notify User
        notificationService.createNotification(
                pawn.getUser().getId(),
                "Loan for " + pawn.getItemName() + " has been paid. Item successfully redeemed.",
                "SUCCESS");

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

        // Notify User
        notificationService.createNotification(
                pawn.getUser().getId(),
                "Loan for " + pawn.getItemName()
                        + " has been forfeited due to non-payment. Item has been moved to inventory.",
                "ERROR");

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

    // renewLoan method removed as per requirements

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
