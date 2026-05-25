package com.shanti.store.marketplace.mapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.OrderItem;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.enums.OrderStatus;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.response.OrderItemResponse;
import com.shanti.store.marketplace.response.OrderResponse;
import com.shanti.store.marketplace.response.ShipmentResponse;

public class OrderMapper {

    private OrderMapper() {}
    
    private static String deriveStatus(List<Shipment> shipments) {
        if (shipments == null || shipments.isEmpty()) return OrderStatus.CREATED.name();

        boolean allRejected = shipments.stream()
                .allMatch(s -> s.getStatus() == ShipmentStatus.REJECTED);

        boolean allDelivered = shipments.stream()
                .allMatch(s -> s.getStatus() == ShipmentStatus.DELIVERED);

        boolean anyShipped = shipments.stream()
                .anyMatch(s ->
                        s.getStatus() == ShipmentStatus.SHIPPED ||
                        s.getStatus() == ShipmentStatus.IN_TRANSIT ||
                        s.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY
                );

        boolean anyAccepted = shipments.stream()
                .anyMatch(s -> s.getStatus() == ShipmentStatus.ACCEPTED);

        boolean allAccepted = shipments.stream()
                .allMatch(s -> s.getStatus() == ShipmentStatus.ACCEPTED);

        boolean anyRejected = shipments.stream()
                .anyMatch(s -> s.getStatus() == ShipmentStatus.REJECTED);

        // ✅ Priority order matters
        if (allDelivered) return OrderStatus.DELIVERED.name();
        if (allRejected) return OrderStatus.CANCELLED.name();
        if (anyRejected) return OrderStatus.PARTIALLY_CANCELLED.name();
        if (anyShipped) return OrderStatus.SHIPPED.name();
        if (allAccepted) return OrderStatus.CONFIRMED.name();
        if (anyAccepted) return OrderStatus.PARTIALLY_CONFIRMED.name();

        return OrderStatus.CREATED.name();
    }

    // ✅ Buyer view (full order)
    public static OrderResponse toResponse(Order order) {
        return toResponse(order, null);
    }

    // ✅ Seller-aware view
    public static OrderResponse toResponse(Order order, Long sellerId) {
        if (order == null) return null;
        
        // ✅ Filter shipments if sellerId provided
        List<Shipment> filteredShipments = order.getShipments() != null
                ? order.getShipments().stream()
                    .filter(s -> sellerId == null ||
                            s.getSellerAccount().getId().equals(sellerId))
                    .collect(Collectors.toList())
                : List.of();

        // ✅ Map shipments
        List<ShipmentResponse> shipmentResponses = filteredShipments.stream()
                .map(OrderMapper::mapShipment)
                .collect(Collectors.toList());

        // ✅ Totals (IMPORTANT: recalc only for seller view)
        BigDecimal subtotal;
        BigDecimal shipping;
        BigDecimal discount;
        BigDecimal total;

        if (sellerId == null) {
            // Buyer → use original totals
            subtotal = order.getSubtotal();
            shipping = order.getTotalShipping();
            discount = order.getTotalDiscount();
            total = order.getTotalPrice();
        } else {
            // Seller → calculate from filtered shipments
            subtotal = filteredShipments.stream()
                    .map(Shipment::getItemsTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            shipping = filteredShipments.stream()
                    .map(Shipment::getShippingCharge)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            discount = filteredShipments.stream()
                    .map(Shipment::getDiscount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            total = filteredShipments.stream()
                    .map(Shipment::getFinalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        String status;

        if (sellerId == null) {
            status = order.getStatus() != null ? order.getStatus().name() : null;
        } else {
            status = deriveStatus(filteredShipments);
        }

        return OrderResponse.builder()
                .id(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .orderNumber(order.getOrderNumber())

                .status(status)

                // 🔥 PAYMENT
                .payment(
                	    sellerId == null
                	        ? PaymentMapper.mapPaymentSummary(order)
                	        : PaymentMapper.mapSellerPaymentSummary(order, sellerId)
                	)
                
                .deliveryAddress(order.getDeliveryAddress())

                .orderDate(order.getOrderDate())
                .deliveryDate(order.getDeliveryDate())

                .subtotal(subtotal)
                .totalShipping(shipping)
                .totalDiscount(discount)
                .totalPrice(total)

                .currency(order.getCurrency() != null ? order.getCurrency() : "INR")

                .shipments(shipmentResponses)

                .build();
    }

    private static ShipmentResponse mapShipment(Shipment shipment) {
        if (shipment == null) return null;

        return ShipmentResponse.builder()
        		.id(shipment.getId())
        		.createdAt(shipment.getCreatedAt())
                .sellerId(shipment.getSellerAccount() != null ? shipment.getSellerAccount().getId() : null)
                .sellerName(shipment.getSellerName())
                .sellerPincode(shipment.getSellerPincode())

                .status(shipment.getStatus() != null ? shipment.getStatus().name() : null)

                .itemsTotal(shipment.getItemsTotal())
                .shippingCharge(shipment.getShippingCharge())
                .discount(shipment.getDiscount())
                .finalAmount(shipment.getFinalAmount())

                .courierPartner(shipment.getCourierPartner())
                .trackingId(shipment.getTrackingId())

                .estimatedDelivery(shipment.getEstimatedDelivery())
                .shippedAt(shipment.getShippedAt())
                .deliveredAt(shipment.getDeliveredAt())

                .items(shipment.getItems() != null
                        ? shipment.getItems().stream()
                        .map(OrderMapper::mapItem)
                        .collect(Collectors.toList())
                        : List.of())

                .transactions(shipment.getTransactions() != null
                        ? shipment.getTransactions().stream()
                        .map(TransactionMapper::mapTransaction)
                        .collect(Collectors.toList())
                        : List.of())

                .build();
    }

    private static OrderItemResponse mapItem(OrderItem item) {
        if (item == null) return null;

        return OrderItemResponse.builder()
                .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                .productName(item.getProductName())

                .variantId(item.getVariant() != null ? item.getVariant().getId() : null)
                .variantName(item.getVariantName())
                .attributes(item.getAttributes())

                .images(item.getVariant() != null ? item.getVariant().getImages() : List.of())

                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .discount(item.getDiscount())

                .productPriceSnapshot(item.getProductPriceSnapshot())
                .build();
    }
}