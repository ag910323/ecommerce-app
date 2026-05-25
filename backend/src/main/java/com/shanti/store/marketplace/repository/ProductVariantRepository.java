package com.shanti.store.marketplace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import com.shanti.store.marketplace.entity.ProductVariant;

import jakarta.persistence.LockModeType;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long>{
	
	@Lock(LockModeType.PESSIMISTIC_WRITE)
	@Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
	Optional<ProductVariant> findByIdForUpdate(Long id);

}
