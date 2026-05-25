package com.shanti.store.marketplace.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shanti.store.marketplace.entity.BrandPartnershipType;

@Repository
public interface BrandPartnershipTypeRepository extends JpaRepository<BrandPartnershipType, Long> {
    List<BrandPartnershipType> findByActiveTrue();
    Optional<BrandPartnershipType> findByIdAndActiveTrue(Long id);
    Optional<BrandPartnershipType> findByNameAndActiveTrue(String name);
}