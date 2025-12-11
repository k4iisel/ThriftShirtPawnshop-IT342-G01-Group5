package com.thriftshirt.pawnshop.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PawnRequestResponse {

    private Long pawnId;
    private String itemName;
    private String brand;
    private String size;
    private String condition;
    private String category;
    private String description;
    private Double loanAmount;
    private Double estimatedValue;
    private Double offeredAmount;
    private String photos;
    private String status;
    private LocalDate appraisalDate;
    private String appraisedBy;
    private Integer interestRate;
    private LocalDate dueDate;
    private LocalDateTime createdAt;
    private Double proposedInterestRate;
    private Integer proposedLoanDuration;

    // Constructor
    public PawnRequestResponse(Long pawnId, String itemName, String brand, String size,
            String condition, String category, String description,
            Double loanAmount, Double estimatedValue, Double offeredAmount, String photos,
            String status, LocalDate appraisalDate, String appraisedBy,
            Integer interestRate, LocalDate dueDate, LocalDateTime createdAt,
            Double proposedInterestRate, Integer proposedLoanDuration) {
        this.pawnId = pawnId;
        this.itemName = itemName;
        this.brand = brand;
        this.size = size;
        this.condition = condition;
        this.category = category;
        this.description = description;
        this.loanAmount = loanAmount;
        this.estimatedValue = estimatedValue;
        this.offeredAmount = offeredAmount;
        this.photos = photos;
        this.status = status;
        this.appraisalDate = appraisalDate;
        this.appraisedBy = appraisedBy;
        this.interestRate = interestRate;
        this.interestRate = interestRate;
        this.dueDate = dueDate;
        this.createdAt = createdAt;
        this.proposedInterestRate = proposedInterestRate;
        this.proposedLoanDuration = proposedLoanDuration;
    }

    // Getters and Setters
    public Long getPawnId() {
        return pawnId;
    }

    public void setPawnId(Long pawnId) {
        this.pawnId = pawnId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
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

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Double getOfferedAmount() {
        return offeredAmount;
    }

    public void setOfferedAmount(Double offeredAmount) {
        this.offeredAmount = offeredAmount;
    }

    public Double getProposedInterestRate() {
        return proposedInterestRate;
    }

    public void setProposedInterestRate(Double proposedInterestRate) {
        this.proposedInterestRate = proposedInterestRate;
    }

    public Integer getProposedLoanDuration() {
        return proposedLoanDuration;
    }

    public void setProposedLoanDuration(Integer proposedLoanDuration) {
        this.proposedLoanDuration = proposedLoanDuration;
    }
}
