package com.thriftshirt.pawnshop.entity;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "pawn_request")
public class PawnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pawnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    private User user;

    @Column(nullable = false)
    private String itemName;

    @Column(name = "category")
    private String category;

    @Column(name = "item_condition") // Avoid 'condition' as it's a MySQL reserved word
    private String condition;

    @Column(name = "brand")
    private String brand;

    @Column(name = "item_size") // Avoid 'size' as it might conflict
    private String size;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "loan_amount")
    private Double loanAmount;

    @Column(name = "estimated_value")
    private Double estimatedValue;

    @Column(name = "photos", columnDefinition = "TEXT")
    private String photos; // could store URLs or JSON (array)

    @Column(name = "status")
    private String status;

    private LocalDate appraisalDate;

    private String appraisedBy;

    @OneToOne(mappedBy = "pawnItem", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("pawnItem")
    private Loan loan;

    // Getters & Setters
    public Long getPawnId() {
        return pawnId;
    }

    public void setPawnId(Long pawnId) {
        this.pawnId = pawnId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getLoanAmount() {
        return loanAmount;
    }

    public void setLoanAmount(Double loanAmount) {
        this.loanAmount = loanAmount;
    }

    public Double getEstimatedValue() {
        return estimatedValue;
    }

    public void setEstimatedValue(Double estimatedValue) {
        this.estimatedValue = estimatedValue;
    }

    public String getPhotos() {
        return photos;
    }

    public void setPhotos(String photos) {
        this.photos = photos;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getAppraisalDate() {
        return appraisalDate;
    }

    public void setAppraisalDate(LocalDate appraisalDate) {
        this.appraisalDate = appraisalDate;
    }

    public String getAppraisedBy() {
        return appraisedBy;
    }

    public void setAppraisedBy(String appraisedBy) {
        this.appraisedBy = appraisedBy;
    }

    public Loan getLoan() {
        return loan;
    }

    public void setLoan(Loan loan) {
        this.loan = loan;
    }

}