package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.entity.OrderItem;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.repository.ShipmentRepository;
import com.shanti.store.marketplace.service.ShippingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShippingServiceImpl implements ShippingService {
	
	@Autowired
	private ShipmentRepository shipmentRepository;
	
    @Override
    public BigDecimal calculateShipping(List<OrderItem> items,
                                        Address address,
                                        SellerAccount seller) {

        BigDecimal orderTotal = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // ✅ 1. FREE SHIPPING RULE
        if (Boolean.TRUE.equals(seller.getFreeShipping())) {
            return BigDecimal.ZERO;
        }

        if (seller.getFreeShippingAbove() != null &&
                orderTotal.compareTo(seller.getFreeShippingAbove()) > 0) {
            return BigDecimal.ZERO;
        }

        // ✅ 2. FLAT SHIPPING (if defined)
        if (seller.getFlatShippingCharge() != null) {
            return seller.getFlatShippingCharge();
        }

        // ✅ 3. WEIGHT BASED (fallback)
        double totalWeight = items.stream()
                .mapToDouble(i ->
                        (i.getProduct().getWeight() != null
                                ? i.getProduct().getWeight()
                                : 0.5)
                        * i.getQuantity()
                )
                .sum();

        // Example slab
        if (totalWeight <= 1) return BigDecimal.valueOf(50);
        if (totalWeight <= 5) return BigDecimal.valueOf(100);
        return BigDecimal.valueOf(200);
    }

	@Override
	public Optional<Shipment> findById(Long shipmentId) {
		return shipmentRepository.findById(shipmentId);
	}

	@Override
	public Shipment save(Shipment shipment) {
		return shipmentRepository.save(shipment);
	}

	@Override
	public List<Shipment> findBySellerAccountIdOrderByCreatedAtDesc(Long sellerId) {
		return shipmentRepository.findBySellerAccountIdOrderByCreatedAtDesc(sellerId);
	}
	
}
