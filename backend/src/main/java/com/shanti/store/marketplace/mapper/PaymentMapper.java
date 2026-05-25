package com.shanti.store.marketplace.mapper;

import java.math.BigDecimal;
import java.util.List;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.enums.PaymentStatus;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.response.PaymentSummaryResponse;

public class PaymentMapper {
	
	private PaymentMapper() {
		
	}
	
	public static PaymentSummaryResponse mapSellerPaymentSummary(Order order, Long sellerId) {

	    if (order == null || order.getPayments() == null || order.getPayments().isEmpty()) {
	        return null;
	    }

	    List<Shipment> sellerShipments = order.getShipments().stream()
	            .filter(s -> s.getSellerAccount().getId().equals(sellerId))
	            .toList();

	    BigDecimal sellerTotal = sellerShipments.stream()
	            .map(s -> s.getFinalAmount() != null ? s.getFinalAmount() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    BigDecimal sellerCollected = sellerShipments.stream()
	            .filter(s -> s.getStatus() == ShipmentStatus.DELIVERED)
	            .map(s -> s.getFinalAmount() != null ? s.getFinalAmount() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    Payment latestPayment = order.getPayments().stream()
	            .reduce((a, b) -> b)
	            .orElse(null);

	    String status;
	    if (sellerCollected.compareTo(sellerTotal) >= 0) {
	        status = PaymentStatus.SUCCESS.name();
	    } else if (sellerCollected.compareTo(BigDecimal.ZERO) > 0) {
	        status = PaymentStatus.PARTIALLY_PAID.name();
	    } else {
	        status = PaymentStatus.PENDING.name();
	    }

	    return PaymentSummaryResponse.builder()
	            .status(status)
	            .method(latestPayment != null && latestPayment.getPaymentMethod() != null
	                    ? latestPayment.getPaymentMethod().name() : null)
	            .totalPaid(sellerCollected)
	            .totalRefunded(BigDecimal.ZERO) // refine later
	            .remainingAmount(sellerTotal.subtract(sellerCollected).max(BigDecimal.ZERO))
	            .build();
	}

	public static PaymentSummaryResponse mapPaymentSummary(Order order) {

	    if (order == null || order.getPayments() == null || order.getPayments().isEmpty()) {
	        return null;
	    }

	    List<Payment> payments = order.getPayments();

	    BigDecimal totalPaid = payments.stream()
	            .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    BigDecimal totalRefunded = payments.stream()
	            .map(p -> p.getRefundedAmount() != null ? p.getRefundedAmount() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    BigDecimal orderTotal = order.getTotalPrice() != null ? order.getTotalPrice() : BigDecimal.ZERO;

	    BigDecimal remaining = orderTotal.subtract(totalPaid).max(BigDecimal.ZERO);

	    Payment latestPayment = payments.stream()
	            .reduce((first, second) -> second)
	            .orElse(null);

	    return PaymentSummaryResponse.builder()
	            .status(latestPayment != null && latestPayment.getStatus() != null
	                    ? latestPayment.getStatus().name() : null)
	            .method(latestPayment != null && latestPayment.getPaymentMethod() != null
	                    ? latestPayment.getPaymentMethod().name() : null)
	            .totalPaid(totalPaid)
	            .totalRefunded(totalRefunded)
	            .remainingAmount(remaining)
	            .build();
	}
	
}
