package com.shanti.store.marketplace.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerContactRequest {
    private String phone;
    private String email;
    private String alternatePhone;
    private String supportContact;
}