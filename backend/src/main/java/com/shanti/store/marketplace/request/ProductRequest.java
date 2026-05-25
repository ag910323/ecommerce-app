package com.shanti.store.marketplace.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.shanti.store.marketplace.entity.Brand;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ProductRequest {
	@NotBlank(message = "Product name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private String sku;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    @NotNull(message = "Seller is required")
    private Long sellerId;
    
    private Long brandId;           // Select from existing brands
    private String brandName;       // Create new brand with this name
    
    @Builder.Default
    private Integer stockQuantity = 0;
    @Builder.Default
    private String status = "ACTIVE";
    @Builder.Default
    private Double rating = 0.0;
    @Builder.Default
    private BigDecimal discountPercentage = BigDecimal.ZERO;
    
    private List<String> imageUrls;
    private Map<String, String> attributes;
 // Add these fields to your ProductRequest class
    @Builder.Default
    private Boolean isSponsored = false;

    @Builder.Default
    private Integer sponsorPriority = 0;

    private LocalDateTime sponsorStartDate;

    private LocalDateTime sponsorEndDate;

    private BigDecimal sponsorBudget;

    private BigDecimal sponsorCostPerClick;

    private String partnershipBadge;

    @Builder.Default
    private Integer partnershipPriority = 0;

    @Builder.Default
    private Brand.PartnershipLevel brandPartnershipLevel = Brand.PartnershipLevel.NONE;
    
    private Double weight;
    private Double length;
    private Double width;
    private Double height;
    private List<ProductVariantRequest> variants;
}
