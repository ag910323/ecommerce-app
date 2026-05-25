package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.OrderStatusHistory;
import com.shanti.store.marketplace.request.OrderStatusHistoryRequest;
import com.shanti.store.marketplace.response.OrderStatusHistoryResponse;

public class OrderStatusHistoryMapper {
	
	private OrderStatusHistoryMapper() {
		
	}

    public static OrderStatusHistory toEntity(OrderStatusHistoryRequest request) {
        return OrderStatusHistory.builder()
                .orderId(request.getOrderId())
                .userId(request.getUserId())
                .oldStatus(request.getOldStatus())
                .newStatus(request.getNewStatus())
                .changedBy(request.getChangedBy())
                .build();
    }

    public static OrderStatusHistoryResponse toResponse(OrderStatusHistory entity) {
        return OrderStatusHistoryResponse.builder()
                .id(entity.getId())
                .orderId(entity.getOrderId())
                .userId(entity.getUserId())
                .oldStatus(entity.getOldStatus())
                .newStatus(entity.getNewStatus())
                .changedBy(entity.getChangedBy())
                .build();
    }
}