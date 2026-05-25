package com.shanti.store.marketplace.request;

import com.shanti.store.marketplace.enums.ShipmentStatus;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentStatusHistoryRequest {

    private Long shipmentId;
    private Long userId;
    private ShipmentStatus oldStatus;
    private ShipmentStatus newStatus;
    private String changedBy;
}