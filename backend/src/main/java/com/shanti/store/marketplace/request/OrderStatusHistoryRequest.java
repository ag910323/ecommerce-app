package com.shanti.store.marketplace.request;

import com.shanti.store.marketplace.enums.OrderStatus;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryRequest {

    private Long orderId;
    private Long userId;
    private OrderStatus oldStatus;
    private OrderStatus newStatus;
    private String changedBy;
}