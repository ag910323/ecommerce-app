package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.ShipmentStatusHistory;
import com.shanti.store.marketplace.request.ShipmentStatusHistoryRequest;
import com.shanti.store.marketplace.response.ShipmentStatusHistoryResponse;

public class ShipmentStatusHistoryMapper {
	
	private ShipmentStatusHistoryMapper() {
		
	}
 
    public static ShipmentStatusHistory toEntity(ShipmentStatusHistoryRequest request) {
        return ShipmentStatusHistory.builder()
                .shipmentId(request.getShipmentId())
                .userId(request.getUserId())
                .oldStatus(request.getOldStatus())
                .newStatus(request.getNewStatus())
                .changedBy(request.getChangedBy())
                .build();
    }

    public static ShipmentStatusHistoryResponse toResponse(ShipmentStatusHistory entity) {
        return ShipmentStatusHistoryResponse.builder()
                .id(entity.getId())
                .shipmentId(entity.getShipmentId())
                .userId(entity.getUserId())
                .oldStatus(entity.getOldStatus())
                .newStatus(entity.getNewStatus())
                .changedBy(entity.getChangedBy())
                .build();
    }
}