package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.entity.BrandPartnership;
import com.shanti.store.marketplace.request.BrandPartnershipRequest;
import com.shanti.store.marketplace.response.BrandResponse;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.response.ProductResponse;

public interface BrandPartnershipService {

    BrandPartnership createPartnership(Long brandId, Long partnershipTypeId, BrandPartnershipRequest request) throws Exception;

    void activatePartnership(Long partnershipId) throws Exception;

    PagedResponse<ProductResponse> getProductsWithBrandPartnership(int page, int size);

    List<BrandResponse> getPartnerBrands(int limit);

    void expireOldPartnerships();
}
