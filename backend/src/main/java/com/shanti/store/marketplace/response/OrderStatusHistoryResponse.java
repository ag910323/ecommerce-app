package com.shanti.store.marketplace.response;

import com.shanti.store.marketplace.enums.OrderStatus;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryResponse {

    private Long id;
    private Long orderId;
    private Long userId;
    private OrderStatus oldStatus;
    private OrderStatus newStatus;
    private String changedBy;
}