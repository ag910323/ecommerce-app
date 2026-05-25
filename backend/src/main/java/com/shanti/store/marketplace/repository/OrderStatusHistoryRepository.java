package com.shanti.store.marketplace.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.OrderStatusHistory;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
    List<OrderStatusHistory> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}