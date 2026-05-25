package com.shanti.store.marketplace.service.impl;

import java.util.Comparator;

import org.springframework.stereotype.Service;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.enums.OrderStatus;
import com.shanti.store.marketplace.enums.PaymentStatus;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.service.OrderStatusService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderStatusServiceImpl implements OrderStatusService {
    
    @Override
    public OrderStatus deriveOrderStatus(Order order) {

        // ✅ FIX 1: handle multiple payments
        Payment payment = getLatestPayment(order);

        boolean paymentSuccess = payment != null &&
                payment.getStatus() == PaymentStatus.SUCCESS;

        // 🔴 Payment gate
        if (!paymentSuccess) {
            return OrderStatus.CREATED; // NOT PENDING
        }

        // 🟢 Shipment logic

        boolean allRejected = order.getShipments().stream()
                .allMatch(s -> s.getStatus() == ShipmentStatus.REJECTED);

        boolean allDelivered = order.getShipments().stream()
                .allMatch(s -> s.getStatus() == ShipmentStatus.DELIVERED);

        boolean anyShipped = order.getShipments().stream()
                .anyMatch(s ->
                        s.getStatus() == ShipmentStatus.SHIPPED ||
                        s.getStatus() == ShipmentStatus.IN_TRANSIT ||
                        s.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY
                );

        boolean anyAccepted = order.getShipments().stream()
                .anyMatch(s -> s.getStatus() == ShipmentStatus.ACCEPTED);

        boolean allAccepted = order.getShipments().stream()
                .allMatch(s -> s.getStatus() == ShipmentStatus.ACCEPTED);

        boolean anyRejected = order.getShipments().stream()
                .anyMatch(s -> s.getStatus() == ShipmentStatus.REJECTED);

        if (allDelivered) {
            return OrderStatus.DELIVERED;
        }

        if (allRejected) {
            return OrderStatus.CANCELLED;
        }

        if (anyShipped) {
            return OrderStatus.SHIPPED;
        }

        if (anyRejected) {
            return OrderStatus.PARTIALLY_CANCELLED;
        }

        if (allAccepted) {
            return OrderStatus.CONFIRMED;
        }

        if (anyAccepted) {
            return OrderStatus.PARTIALLY_CONFIRMED;
        }

        return OrderStatus.CREATED;
    }
    
    @Override
    public void updateOrderStatus(Order order) {

        OrderStatus newStatus = deriveOrderStatus(order);

        order.setStatus(newStatus);

        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveryDate(java.time.LocalDateTime.now());
        } else {
            order.setDeliveryDate(null);
        }
    }
    
    private Payment getLatestPayment(Order order) {

        if (order.getPayments() == null || order.getPayments().isEmpty()) {
            return null;
        }

        return order.getPayments().stream()
                .max(Comparator.comparing(Payment::getCreatedAt))
                .orElse(null);
    }
}
