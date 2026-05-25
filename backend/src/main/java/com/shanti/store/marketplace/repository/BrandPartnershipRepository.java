package com.shanti.store.marketplace.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.BrandPartnership;
import com.shanti.store.marketplace.entity.BrandPartnership.PartnershipStatus;

public interface BrandPartnershipRepository extends JpaRepository<BrandPartnership, Long>{

	boolean existsByBrandIdAndStatus(Long brandId, PartnershipStatus active);

	List<BrandPartnership> findAllByEndDateBeforeAndStatusNot(LocalDateTime now, PartnershipStatus expired);

}
