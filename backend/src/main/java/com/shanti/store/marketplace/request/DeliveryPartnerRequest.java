package com.shanti.store.marketplace.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerRequest {

    private String fullName;
    private String vehicleType; // e.g., Bike, Van, Truck
    private String vehicleNumber;

    private List<DeliveryPartnerDocumentRequest> documents; // list of documents
}
