package com.thriftshirt.pawnshop.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

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

}
