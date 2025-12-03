package com.thriftshirt.pawnshop.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pawn_request")
public class PawnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pawnId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String itemName;

    private String category;

    private String condition;

    private String brand;

    private String size;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double requestedAmount;

    private Double estimatedValue;

    @Column(columnDefinition = "TEXT")
    private String photos; // could store URLs or JSON (array)

    private String status;

    private LocalDate appraisalDate;

    private String appraisedBy;

    @OneToOne(mappedBy = "pawnItem", cascade = CascadeType.ALL)
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
    public Double getRequestedAmount() {
        return requestedAmount;
    }
    public void setRequestedAmount(Double requestedAmount) {
        this.requestedAmount = requestedAmount;
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
