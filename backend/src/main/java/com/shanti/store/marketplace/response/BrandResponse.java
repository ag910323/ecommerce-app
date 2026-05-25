package com.shanti.store.marketplace.response;

import java.util.List;

import com.shanti.store.marketplace.entity.Brand.PartnershipLevel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {
    private Long id;
    private String name;
    private String description;
    private String logo;
    private String partnershipBadge;
//    private String partnershipLevel;
    private Integer partnershipPriority;
    private PartnershipLevel partnershipLevel;
    private List<BrandPartnershipResponse> brandPartnershipResponses;

    private BrandPartnershipResponse currentPartnership;
}
