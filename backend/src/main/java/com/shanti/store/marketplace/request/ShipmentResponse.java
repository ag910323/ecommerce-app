package com.shanti.store.marketplace.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.response.OrderItemResponse;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShipmentResponse {

    private Long shipmentId;
    private Long sellerId;
    private String sellerName;

    private ShipmentStatus status;

    private String courierPartner;
    private String trackingId;

    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedDelivery;

    private BigDecimal itemsTotal;
    private BigDecimal shippingCharge;
    private BigDecimal discount;
    private BigDecimal finalAmount;

    private List<OrderItemResponse> items;
}
