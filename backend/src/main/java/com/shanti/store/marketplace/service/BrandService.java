package com.shanti.store.marketplace.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.shanti.store.marketplace.request.BrandFilterRequest;
import com.shanti.store.marketplace.request.BrandRequest;
import com.shanti.store.marketplace.response.BrandResponse;

public interface BrandService {
	
	Page<BrandResponse> findAll(Pageable pageable);
    Page<BrandResponse> findByNameContainingIgnoreCase(String name, Pageable pageable);
    BrandResponse findById(Long id);
    BrandResponse save(BrandRequest request);
    BrandResponse update(Long id, BrandRequest request);
    void deleteById(Long id);
    Page<BrandResponse> filterBrands(BrandFilterRequest filterRequest, Pageable pageable);
    List<BrandResponse> getAllBrandsSimple();

}
