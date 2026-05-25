package com.shanti.store.marketplace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

	Optional<Payment> findByGatewayOrderId(String gatewayOrderId);

}
