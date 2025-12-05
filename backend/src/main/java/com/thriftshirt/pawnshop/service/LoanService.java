package com.thriftshirt.pawnshop.service;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.thriftshirt.pawnshop.entity.Loan;
import com.thriftshirt.pawnshop.entity.PawnRequest;
import com.thriftshirt.pawnshop.exception.BadRequestException;
import com.thriftshirt.pawnshop.exception.ResourceNotFoundException;
import com.thriftshirt.pawnshop.repository.PawnRequestRepository;

@Service
@Transactional
public class LoanService {

    private static final Logger logger = LoggerFactory.getLogger(LoanService.class);

    @Autowired
    private PawnRequestRepository pawnRequestRepository;

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
        return savedLoan;
    }
}
