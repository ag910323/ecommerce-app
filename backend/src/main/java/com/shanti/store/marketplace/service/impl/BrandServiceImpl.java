package com.shanti.store.marketplace.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Brand;
import com.shanti.store.marketplace.mapper.BrandMapper;
import com.shanti.store.marketplace.repository.BrandRepository;
import com.shanti.store.marketplace.request.BrandFilterRequest;
import com.shanti.store.marketplace.request.BrandRequest;
import com.shanti.store.marketplace.response.BrandResponse;
import com.shanti.store.marketplace.service.BrandService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandServiceImpl implements BrandService {

    private final BrandRepository brandRepository;

    @Override
    public Page<BrandResponse> findAll(Pageable pageable) {
        return brandRepository.findByActiveTrue(pageable)
                .map(BrandMapper::toResponse);
    }

    @Override
    public Page<BrandResponse> findByNameContainingIgnoreCase(String name, Pageable pageable) {
        return brandRepository.findByNameContainingIgnoreCaseAndActiveTrue(name, pageable)
                .map(BrandMapper::toResponse);
    }

    @Override
    public BrandResponse findById(Long id) {
        Brand brand = brandRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        return BrandMapper.toResponse(brand);
    }

    @Override
    @Transactional
    public BrandResponse save(BrandRequest request) {
        Brand brand = BrandMapper.toEntity(request);
        return BrandMapper.toResponse(brandRepository.save(brand));
    }

    @Override
    @Transactional
    public BrandResponse update(Long id, BrandRequest request) {
        Brand existingBrand = brandRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        
        existingBrand.setName(request.getName());
        existingBrand.setDescription(request.getDescription());
        if (request.getLogo() != null) {
        	existingBrand.setLogo(request.getLogo());
        }
        existingBrand.setPartnershipLevel(request.getPartnershipLevel());
        existingBrand.setPartnershipBadge(request.getPartnershipBadge());
        existingBrand.setPartnershipPriority(request.getPartnershipPriority());
        
        return BrandMapper.toResponse(brandRepository.save(existingBrand));
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        Brand brand = brandRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        
        brand.setActive(false); // Soft delete
        brandRepository.save(brand);
    }
    
    @Override
    public Page<BrandResponse> filterBrands(BrandFilterRequest filterRequest, Pageable pageable) {
        return brandRepository.filterBrands(
            filterRequest.getName(),
            filterRequest.getDescription(),
            filterRequest.getPartnershipLevel(),
            filterRequest.getHasLogo(),
            filterRequest.getIsPartner(),
            filterRequest.getPartnershipBadge(),
            pageable
        ).map(BrandMapper::toResponse);
    }
    
    @Override
    public List<BrandResponse> getAllBrandsSimple() {
        return brandRepository.findByActiveTrue(Sort.by("name").ascending())
                .stream()
                .map(BrandMapper::toResponse)
                .collect(Collectors.toList());
    }
}