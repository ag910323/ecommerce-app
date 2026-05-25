package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.response.BrandPartnershipTypeResponse;

public interface BrandPartnershipTypeService {
    List<BrandPartnershipTypeResponse> getAllTypes();
    BrandPartnershipTypeResponse findById(Long id);
}