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
import com.thriftshirt.pawnshop.exception.BadRequestException;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.LoanRepository;
import com.thriftshirt.pawnshop.repository.PawnRequestRepository;
import com.thriftshirt.pawnshop.entity.TransactionLog;

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

    /**
     * Create a loan from an approved pawn request
     */
    public Loan createLoan(Long pawnId) {
        logger.info("Creating loan for pawn request ID: {}", pawnId);

        PawnRequest pawnRequest = pawnRequestRepository.findById(pawnId)
                .orElseThrow(() -> new ResourceNotFoundException("Pawn request not found"));

        // Validate status
        if (!"APPROVED".equals(pawnRequest.getStatus())) {
            throw new BadRequestException(
                    "Cannot create loan. Pawn request status must be APPROVED, but is: " + pawnRequest.getStatus());
        }

        // Check if loan already exists
        if (pawnRequest.getLoan() != null) {
            throw new BadRequestException("Loan already exists for this pawn request");
        }

        // Create loan
        Loan loan = new Loan();
        loan.setPawnItem(pawnRequest);

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

        // Setup bidirectional relationship
        pawnRequest.setLoan(loan);
        pawnRequest.setStatus("PAWNED");

        // Save via PawnRequest (cascades to Loan)
        pawnRequest = pawnRequestRepository.save(pawnRequest);
        Loan savedLoan = pawnRequest.getLoan();

        logger.info("✅ Loan created successfully. Loan ID: {}, Pawn ID: {}", savedLoan.getLoanId(), pawnId);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawnRequest.getUser());
        log.setAction("LOAN_CREATED");
        log.setRemarks("Loan created for item: " + pawnRequest.getItemName() + " (ID: " + pawnId + ")");
        log.setCondition(pawnRequest.getCondition());
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
    public Loan processPayment(Long loanId) {
        logger.info("Processing payment for loan ID: {}", loanId);

        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found"));

        if (!"ACTIVE".equals(loan.getStatus())) {
            throw new BadRequestException("Loan is not active. Current status: " + loan.getStatus());
        }

        // Update Loan
        loan.setStatus("PAID");
        loan.setDateRedeemed(LocalDate.now());

        // Update Pawn Item
        PawnRequest pawn = loan.getPawnItem();
        pawn.setStatus("REDEEMED");

        loanRepository.save(loan);
        pawnRequestRepository.save(pawn); // Explicitly save parent to ensure sync

        logger.info("✅ Loan {} paid and item redeemed", loanId);

        // Log transaction
        TransactionLog log = new TransactionLog();
        log.setUser(pawn.getUser());
        log.setAction("LOAN_PAID");
        log.setRemarks("Loan " + loanId + " paid. Item " + pawn.getItemName() + " redeemed.");
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
}
