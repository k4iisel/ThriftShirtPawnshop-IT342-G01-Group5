package com.thriftshirt.pawnshop.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "loan")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long loanId;

    @OneToOne
    @JoinColumn(name = "pawn_id")
    @JsonIgnoreProperties("loan")
    private PawnRequest pawnItem;

    @Column(nullable = false)
    private BigDecimal loanAmount;

    private Integer interestRate;

    private LocalDate dueDate;

    private String status;

    private BigDecimal penalty;

    private LocalDate dateRedeemed;

    // Getters & Setters
    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public PawnRequest getPawnItem() {
        return pawnItem;
    }

    public void setPawnItem(PawnRequest pawnItem) {
        this.pawnItem = pawnItem;
    }

    public BigDecimal getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(BigDecimal loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Integer getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Integer interestRate) {
        this.interestRate = interestRate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getPenalty() {
        return penalty;
    }

    public void setPenalty(BigDecimal penalty) {
        this.penalty = penalty;
    }

    public LocalDate getDateRedeemed() {
        return dateRedeemed;
    }

    public void setDateRedeemed(LocalDate dateRedeemed) {
        this.dateRedeemed = dateRedeemed;
    }

    /**
     * Calculate the total amount to redeem (loan amount + interest + penalty)
     */
    public BigDecimal calculateTotalRedeemAmount() {
        BigDecimal total = this.loanAmount != null ? this.loanAmount : BigDecimal.ZERO;

        // Add interest calculation if applicable
        if (this.interestRate != null && this.interestRate > 0) {
            BigDecimal interestAmount = total.multiply(BigDecimal.valueOf(this.interestRate))
                    .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            total = total.add(interestAmount);
        }

        // Add penalty if exists
        if (this.penalty != null) {
            total = total.add(this.penalty);
        }

        return total;
    }

    /**
     * Calculate interest amount only
     */
    public BigDecimal calculateInterestAmount() {
        if (this.loanAmount == null || this.interestRate == null || this.interestRate <= 0) {
            return BigDecimal.ZERO;
        }

        return this.loanAmount.multiply(BigDecimal.valueOf(this.interestRate))
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
    }

    /**
     * Helper getter for API response
     */
    public BigDecimal getTotalRedeemAmount() {
        return calculateTotalRedeemAmount();
    }

}
