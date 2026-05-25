package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ShipmentResponse {

    private Long id;
//    private Long shipmentId;

    private Long sellerId;
    private String sellerName;
    private String sellerPincode;

    private BigDecimal itemsTotal;
    private BigDecimal shippingCharge;
    private BigDecimal discount;
    private BigDecimal finalAmount;

    private String courierPartner;
    private String trackingId;
    private String status;

    private LocalDateTime estimatedDelivery;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;

    private List<OrderItemResponse> items;
    
    private List<TransactionResponse> transactions;
}