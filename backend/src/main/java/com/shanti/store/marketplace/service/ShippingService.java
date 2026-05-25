package com.shanti.store.marketplace.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.entity.OrderItem;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.Shipment;

public interface ShippingService {
    BigDecimal calculateShipping(List<OrderItem> items, Address delivery, SellerAccount seller);

	Optional<Shipment> findById(Long shipmentId);

	Shipment save(Shipment shipment);

	List<Shipment> findBySellerAccountIdOrderByCreatedAtDesc(Long sellerId);
	
}
