package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrandPartnershipTypeResponse {
    private Long id;
    private String name;
    private String displayName;
    private String badgeColor;
    private Integer priorityBoost;
    private BigDecimal monthlyFee;
    private String description;
    private String benefits;
}