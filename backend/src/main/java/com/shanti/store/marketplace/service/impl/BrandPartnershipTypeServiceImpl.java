package com.shanti.store.marketplace.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.BrandPartnershipType;
import com.shanti.store.marketplace.mapper.BrandPartnershipTypeMapper;
import com.shanti.store.marketplace.repository.BrandPartnershipTypeRepository;
import com.shanti.store.marketplace.response.BrandPartnershipTypeResponse;
import com.shanti.store.marketplace.service.BrandPartnershipTypeService;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BrandPartnershipTypeServiceImpl implements BrandPartnershipTypeService {

    private final BrandPartnershipTypeRepository repository;

    @Override
    public List<BrandPartnershipTypeResponse> getAllTypes() {
        return repository.findByActiveTrue()
                .stream()
                .map(BrandPartnershipTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BrandPartnershipTypeResponse findById(Long id) {
        BrandPartnershipType type = repository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Partnership type not found with id: " + id));
        return BrandPartnershipTypeMapper.toResponse(type);
    }
}