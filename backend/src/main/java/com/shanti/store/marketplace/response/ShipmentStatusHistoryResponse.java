package com.shanti.store.marketplace.response;

import com.shanti.store.marketplace.enums.ShipmentStatus;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentStatusHistoryResponse {

    private Long id;
    private Long shipmentId;
    private Long userId;
    private ShipmentStatus oldStatus;
    private ShipmentStatus newStatus;
    private String changedBy;
}