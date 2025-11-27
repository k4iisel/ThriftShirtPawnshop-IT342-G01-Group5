package com.thriftshirt.pawnshop.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "pawn_request")
public class PawnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pawnId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String itemName;
    private String category;
    private String condition;
    private String brand;
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String photos; // Could be JSON, URLs, etc.

    private String status; // Pending / Approved / Rejected / For Loan

    @Temporal(TemporalType.DATE)
    private Date appraisalDate;
    private String appraisedBy; // name or employee ID

    // For loan relationship
    @OneToOne(mappedBy = "pawnItem")
    private Loan loan;

    // For resale relationship
    @OneToOne(mappedBy = "pawnItem")
    private ResaleItem resaleItem;

    private Double requestedAmount;
    private Double estimatedValue;
    private String size;

    // Getters and Setters
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public Date getAppraisalDate() {
        return appraisalDate;
    }

    public void setAppraisalDate(Date appraisalDate) {
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

    public ResaleItem getResaleItem() {
        return resaleItem;
    }

    public void setResaleItem(ResaleItem resaleItem) {
        this.resaleItem = resaleItem;
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

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }
    
}
