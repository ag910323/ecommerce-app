package com.shanti.store.marketplace.request;


import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BrandPartnershipRequest {
    
    @NotNull
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    private String contractTerms;
    
    private String specialBenefits;
}

