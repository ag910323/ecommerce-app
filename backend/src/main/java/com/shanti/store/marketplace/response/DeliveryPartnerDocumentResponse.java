package com.shanti.store.marketplace.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerDocumentResponse {

    private Long id;
    private String documentType;
    private String documentUrl;
}
