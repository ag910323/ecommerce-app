package com.shanti.store.marketplace.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerAddressRequest {
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private Boolean isWarehouse;
}
