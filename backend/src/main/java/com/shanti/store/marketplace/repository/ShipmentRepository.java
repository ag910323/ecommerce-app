package com.shanti.store.marketplace.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shanti.store.marketplace.entity.Shipment;

@Repository
public interface ShipmentRepository extends JpaRepository<Shipment, Long> {

	List<Shipment> findBySellerAccountIdOrderByCreatedAtDesc(Long sellerId);
	
}