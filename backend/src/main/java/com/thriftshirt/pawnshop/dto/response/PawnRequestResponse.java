package com.thriftshirt.pawnshop.dto.response;

import java.time.LocalDate;

public class PawnRequestResponse {
    
    private Long pawnId;
    private String itemName;
    private String brand;
    private String size;
    private String condition;
    private String category;
    private String description;
    private Double requestedAmount;
    private Double estimatedValue;
    private String photos;
    private String status;
    private LocalDate appraisalDate;
    private String appraisedBy;
    
    // Constructor
    public PawnRequestResponse(Long pawnId, String itemName, String brand, String size, 
                               String condition, String category, String description,
                               Double requestedAmount, Double estimatedValue, String photos,
                               String status, LocalDate appraisalDate, String appraisedBy) {
        this.pawnId = pawnId;
        this.itemName = itemName;
        this.brand = brand;
        this.size = size;
        this.condition = condition;
        this.category = category;
        this.description = description;
        this.requestedAmount = requestedAmount;
        this.estimatedValue = estimatedValue;
        this.photos = photos;
        this.status = status;
        this.appraisalDate = appraisalDate;
        this.appraisedBy = appraisedBy;
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
}
