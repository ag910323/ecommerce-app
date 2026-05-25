package com.shanti.store.marketplace.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerResponse {

    private Long id;
    private String status;
    private DeliveryPartnerProfileResponse profile;
}
