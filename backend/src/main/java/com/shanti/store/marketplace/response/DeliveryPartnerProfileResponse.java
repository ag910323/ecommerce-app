package com.shanti.store.marketplace.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerProfileResponse {

    private Long id;
    private String fullName;
    private String vehicleType;
    private String vehicleNumber;
    private List<com.shanti.store.marketplace.response.DeliveryPartnerDocumentResponse> documents;
}
