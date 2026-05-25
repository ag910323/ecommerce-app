package com.shanti.store.marketplace.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerContactResponse {
    private String phone;
    private String email;
    private String alternatePhone;
    private String supportContact;
}
