package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.BrandPartnership;
import com.shanti.store.marketplace.response.BrandPartnershipResponse;

public class BrandPartnershipMapper {
    
    private BrandPartnershipMapper() {}

    public static BrandPartnershipResponse toResponse(BrandPartnership partnership) {
        if (partnership == null) {
            return null;
        }

        return BrandPartnershipResponse.builder()
                .id(partnership.getId())
                .partnershipType(BrandPartnershipTypeMapper.toResponse(partnership.getPartnershipType()))
                .startDate(partnership.getStartDate())
                .endDate(partnership.getEndDate())
                .monthlyFee(partnership.getMonthlyFee())
                .status(partnership.getStatus())
                .contractTerms(partnership.getContractTerms())
                .specialBenefits(partnership.getSpecialBenefits())
                .build();
    }
}