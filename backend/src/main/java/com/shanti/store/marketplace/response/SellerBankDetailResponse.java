package com.shanti.store.marketplace.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerBankDetailResponse {

    private String accountNumber;
    private String accountType;
    private String ifscCode;
    private String bankName;
}
