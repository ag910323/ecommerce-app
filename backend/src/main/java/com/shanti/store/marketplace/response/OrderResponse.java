package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {

    private Long id;
    private Long userId;
    private String orderNumber;

    private String status;

    private String deliveryAddress;

    private LocalDateTime orderDate;
    private LocalDateTime deliveryDate;

    private BigDecimal subtotal;
    private BigDecimal totalShipping;
    private BigDecimal totalDiscount;
    private BigDecimal totalPrice;

    private String currency;

    private List<ShipmentResponse> shipments;
    private PaymentSummaryResponse payment;
}