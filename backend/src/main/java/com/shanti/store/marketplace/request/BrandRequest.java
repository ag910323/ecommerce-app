package com.shanti.store.marketplace.request;

import com.shanti.store.marketplace.entity.Brand.PartnershipLevel;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandRequest {
    
	@NotBlank(message = "Brand name is required")
    @Size(max = 100, message = "Brand name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logo;

    @Builder.Default
    private PartnershipLevel partnershipLevel = PartnershipLevel.NONE;

    @Size(max = 100, message = "Partnership badge must not exceed 100 characters")
    private String partnershipBadge;

    @Builder.Default
    private Integer partnershipPriority = 0;
}