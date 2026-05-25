package com.shanti.store.marketplace.request;

import com.shanti.store.marketplace.entity.Brand.PartnershipLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandFilterRequest {
    
    private String name;
    private String description;
    private PartnershipLevel partnershipLevel;
    private Boolean hasLogo;
    private Boolean isPartner; // true = has any partnership, false = no partnership, null = all
    private String partnershipBadge;
    
    // Pagination
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 20;
    @Builder.Default
    private String sortBy = "name";
    @Builder.Default
    private String sortDir = "asc";

}

