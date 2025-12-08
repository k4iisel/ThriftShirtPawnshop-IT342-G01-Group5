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
     * Create a loan from an approved pawn request
     */
    public Loan createLoan(Long pawnId) {
        logger.info("Creating loan for pawn request ID: {}", pawnId);

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
            logger.info("Renewing existing loan ID: {} for pawn ID: {}", loan.getLoanId(), pawnId);
        } else {
            // Create new loan
            loan = new Loan();
            loan.setPawnItem(pawnRequest);
        }

        Double loanAmountDouble = pawnRequest.getEstimatedValue() != null ? pawnRequest.getEstimatedValue()
                : pawnRequest.getRequestedAmount();

        if (loanAmountDouble == null) {
            throw new BadRequestException("Cannot create loan: No amount value found");
        }

        loan.setLoanAmount(BigDecimal.valueOf(loanAmountDouble));

        // Default Terms
        loan.setInterestRate(5); // 5%
        loan.setDueDate(LocalDate.now().plusDays(30)); // 30 Days
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
        log.setRemarks(String.format("Loan created for item: %s (ID: %d). ₱%.2f added to wallet. New wallet balance: ₱%.2f", 
            pawnRequest.getItemName(), pawnId, loan.getLoanAmount().doubleValue(), user.getWalletBalance().doubleValue()));
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
                "Amount is not enough. Required: ₱%.2f, Available: ₱%.2f", 
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

        logger.info("✅ Loan {} paid and item redeemed. Amount deducted: ₱{}", loanId, totalRedeemAmount);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawn.getUser());
        log.setAction("LOAN_PAID");
        log.setRemarks(String.format("Loan %d paid (₱%.2f deducted from wallet). Item %s redeemed.", 
                loanId, totalRedeemAmount.doubleValue(), pawn.getItemName()));
        log.setCondition(pawn.getCondition());
        transactionLogService.logTransaction(log);

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

        // Check if item is redeemed and can be renewed
        if (!"REDEEMED".equals(pawnRequest.getStatus())) {
            throw new BadRequestException("Loans can only be renewed for redeemed items. Current status: " + pawnRequest.getStatus());
        }

        // Get the existing loan for this pawn item
        Loan existingLoan = pawnRequest.getLoan();
        if (existingLoan == null) {
            throw new BadRequestException("No existing loan found for this pawn item");
        }

        // Change pawn request status to APPROVED so it appears in admin validate page
        pawnRequest.setStatus("APPROVED");

        // Keep the loan in PAID status
        // Admin will validate and create/renew the loan when they process it

        // Save the pawn request
        pawnRequestRepository.save(pawnRequest);

        logger.info("✅ Loan renewal requested. Pawn ID: {} status changed to APPROVED for validation", pawnId);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawnRequest.getUser());
        log.setAction("LOAN_RENEWAL_REQUESTED");
        log.setRemarks("Loan renewal requested for previously redeemed item: " + pawnRequest.getItemName() + " (Pawn ID: " + pawnId + "). Status changed to APPROVED, awaiting validation.");
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
