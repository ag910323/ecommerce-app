package com.shanti.store.marketplace.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerDocumentRequest {

    private String documentType;
    private String documentUrl;
}
