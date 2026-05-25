package com.shanti.store.marketplace.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.ShipmentStatusHistory;

public interface ShipmentStatusHistoryRepository extends JpaRepository<ShipmentStatusHistory, Long> {

    List<ShipmentStatusHistory> findByShipmentIdOrderByCreatedAtAsc(Long shipmentId);
}