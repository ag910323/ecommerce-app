package com.shanti.store.marketplace.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SponsorshipCampaignRequest {
    
    @NotNull
    private Long productId;
    
    @NotBlank
    private String campaignName;
    
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal budget;
    
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal costPerClick;
    
    @DecimalMin("0.01")
    private BigDecimal dailyBudget;
    
    private String targetKeywords;
    
    @NotNull
    @Future
    private LocalDateTime startDate;
    
    @NotNull
    @Future
    private LocalDateTime endDate;
    
    private Long sellerId;
}
