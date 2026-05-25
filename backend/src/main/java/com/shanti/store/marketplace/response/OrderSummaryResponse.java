package com.shanti.store.marketplace.response;

import java.math.BigDecimal;

import com.shanti.store.marketplace.enums.OrderStatus;
import com.shanti.store.marketplace.enums.PaymentStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OrderSummaryResponse {
    private Long orderId;
    private String orderNumber;
    private BigDecimal totalPrice;
//    private PaymentStatus paymentStatus;
    private OrderStatus status;
    private BigDecimal refundedAmount;
}
