package com.thriftshirt.pawnshop.dto.request;

import jakarta.validation.constraints.NotBlank;

public class CreatePawnRequestDTO {

    @NotBlank(message = "Item name is required")
    private String itemName;

    private String brand;

    @NotBlank(message = "Size is required")
    private String size;

    @NotBlank(message = "Condition is required")
    private String condition;

    private String description;

    private String photos; // JSON string of photo URLs or base64

    private String category; // Derived from item name or provided

    // Default constructor
    public CreatePawnRequestDTO() {
    }

    // Getters and Setters
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}
