package com.shanti.store.marketplace.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductSponsorshipRequest {
	private Boolean isSponsored;
    private Integer sponsorPriority;
    private LocalDateTime sponsorStartDate;
    private LocalDateTime sponsorEndDate;
    private BigDecimal sponsorBudget;
    private BigDecimal sponsorCostPerClick;
}