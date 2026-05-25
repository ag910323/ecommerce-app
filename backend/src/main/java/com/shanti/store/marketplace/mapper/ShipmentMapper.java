package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.response.ShipmentResponse;

public class ShipmentMapper {

	private ShipmentMapper( ) {
		
	}
	
    public static ShipmentResponse toResponse(Shipment shipment) {
        return ShipmentResponse.builder()
                .id(shipment.getId())
                .sellerId(shipment.getSellerAccount().getId())
                .sellerName(shipment.getSellerName())
                .status(shipment.getStatus().name())
                .itemsTotal(shipment.getItemsTotal())
                .shippingCharge(shipment.getShippingCharge())
                .finalAmount(shipment.getFinalAmount())
                .createdAt(shipment.getCreatedAt())
                .build();
    }
}
