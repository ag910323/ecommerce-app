package com.shanti.store.marketplace.mapper;

import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.Brand;
import com.shanti.store.marketplace.request.BrandRequest;
import com.shanti.store.marketplace.response.BrandResponse;

public class BrandMapper {
    
    private BrandMapper() {
        
    }

    public static Brand toEntity(BrandRequest request) {
        if (request == null) {
            return null;
        }

        return Brand.builder()
                .name(request.getName())
                .description(request.getDescription())
                .logo(request.getLogo())
                .partnershipLevel(request.getPartnershipLevel())
                .partnershipBadge(request.getPartnershipBadge())
                .partnershipPriority(request.getPartnershipPriority())
                .build();
    }

    public static BrandResponse toResponse(Brand brand) {
        if (brand == null) {
            return null;
        }

        return BrandResponse.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .logo(brand.getLogo())
                .partnershipLevel(brand.getPartnershipLevel())
                .partnershipBadge(brand.getPartnershipBadge())
                .partnershipPriority(brand.getPartnershipPriority())
                .brandPartnershipResponses(brand.getPartnerships().stream()
                    .map(BrandPartnershipMapper::toResponse)
                    .collect(Collectors.toList()))
                .currentPartnership(brand.getCurrentPartnership()
                    .map(BrandPartnershipMapper::toResponse)
                    .orElse(null))
                .build();
    }
}