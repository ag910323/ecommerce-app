package com.shanti.store.marketplace.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    private String fullName;        // ✅ NEW
    private String phoneNumber;     // ✅ NEW

    private String street;
    private String city;
    private String state;
    private String country;
    private String zipCode;

    private String landmark;        // ✅ OPTIONAL
    private String addressType;     // ✅ Home / Office
}