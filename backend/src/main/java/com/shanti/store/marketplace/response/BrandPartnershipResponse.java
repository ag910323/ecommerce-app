package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.shanti.store.marketplace.entity.BrandPartnership.PartnershipStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrandPartnershipResponse {
    private Long id;
    private BrandPartnershipTypeResponse partnershipType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyFee;
    private PartnershipStatus status;
    private String contractTerms;
    private String specialBenefits;
}