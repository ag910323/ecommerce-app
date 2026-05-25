package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.BrandPartnershipType;
import com.shanti.store.marketplace.response.BrandPartnershipTypeResponse;

public class BrandPartnershipTypeMapper {
    
    private BrandPartnershipTypeMapper() {}

    public static BrandPartnershipTypeResponse toResponse(BrandPartnershipType type) {
        if (type == null) {
            return null;
        }

        return BrandPartnershipTypeResponse.builder()
                .id(type.getId())
                .name(type.getName())
                .displayName(type.getDisplayName())
                .badgeColor(type.getBadgeColor())
                .priorityBoost(type.getPriorityBoost())
                .monthlyFee(type.getMonthlyFee())
                .description(type.getDescription())
                .benefits(type.getBenefits())
                .build();
    }
}