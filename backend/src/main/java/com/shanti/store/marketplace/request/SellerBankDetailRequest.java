package com.shanti.store.marketplace.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerBankDetailRequest {
    private String accountNumber;
    private String accountType;
    private String ifscCode;
    private String bankName;
}
