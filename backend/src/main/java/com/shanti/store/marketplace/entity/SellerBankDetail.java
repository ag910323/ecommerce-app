package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.SellerBankDetailConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = SellerBankDetailConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class SellerBankDetail extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = SellerBankDetailConstants.COL_SELLER_PROFILE, nullable = false)
    @ToString.Exclude
    private SellerProfile sellerProfile;

    @Column(name = SellerBankDetailConstants.COL_ACCOUNT_NUMBER, nullable = false)
    private String accountNumber;

    @Column(name = SellerBankDetailConstants.COL_ACCOUNT_TYPE, nullable = false)
    private String accountType;

    @Column(name = SellerBankDetailConstants.COL_IFSC_CODE, nullable = false)
    private String ifscCode;

    @Column(name = SellerBankDetailConstants.COL_BANK_NAME)
    private String bankName;
}
