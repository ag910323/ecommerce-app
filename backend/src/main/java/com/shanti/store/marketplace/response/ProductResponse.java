package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.shanti.store.marketplace.entity.Brand;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String sku;
    private String brand;
    private Long categoryId;
    private String categoryName;
    private Integer stockQuantity;
    private String status;
    private Double rating;
    private BigDecimal discountPercentage;
    private String sellerName;
    private List<String> imageUrls;
    private Map<String, String> attributes;
    private Long brandId;
    private String brandName;
    private BrandResponse brandResponse;
    
    private String partnershipBadge;
    private String partnershipLevel; // "PARTNER", "FEATURED", "TOP", "EXCLUSIVE"
    private Integer partnershipPriority;
    
    // Sponsorship fields
    private Boolean isSponsored;
    private Integer sponsorPriority;
    
    private LocalDateTime sponsorStartDate;
    private LocalDateTime sponsorEndDate;
    private BigDecimal sponsorBudget;
    private BigDecimal sponsorCostPerClick;
    private Brand.PartnershipLevel brandPartnershipLevel;
    private Boolean isCurrentlySponsored;
    
    private Double weight;
    private Double length;
    private Double width;
    private Double height;
    private BigDecimal originalPrice;
    private BigDecimal discountAmount;

    private Integer reviewCount;

    private String stockStatus;
    private Boolean isLowStock;

    private String primaryImage;
    private List<String> thumbnailImages;

    private List<String> highlights;
    private List<ReviewResponse> reviews;
    private List<ProductVariantResponse> variants;
    
    // Combined badge for display
    public String getDisplayBadge() {
        if (partnershipBadge != null) {
            return partnershipBadge;
        } else if (isSponsored != null && isSponsored) {
            return "Sponsored";
        }
        return null;
    }
}
