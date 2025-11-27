package com.thriftshirt.pawnshop.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "resale_item")
public class ResaleItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long resaleId;

    @OneToOne
    @JoinColumn(name = "pawn_id")
    private PawnRequest pawnItem;

    private String itemName;
    private String category;
    private String description;
    private String condition;

    private Double price;

    @Column(columnDefinition = "TEXT")
    private String photos;

    private String status; // Available / Sold

    @Temporal(TemporalType.DATE)    
    private Date dateListed;
    private String listedBy;

    public Long getResaleId() {
        return resaleId;
    }

    public void setResaleId(Long resaleId) {
        this.resaleId = resaleId;
    }

    public PawnRequest getPawnItem() {
        return pawnItem;
    }

    public void setPawnItem(PawnRequest pawnItem) {
        this.pawnItem = pawnItem;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
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

    public Date getDateListed() {
        return dateListed;
    }

    public void setDateListed(Date dateListed) {
        this.dateListed = dateListed;
    }

    public String getListedBy() {
        return listedBy;
    }

    public void setListedBy(String listedBy) {
        this.listedBy = listedBy;
    }
}
