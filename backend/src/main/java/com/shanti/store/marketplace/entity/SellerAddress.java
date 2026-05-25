package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.SellerAddressConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = SellerAddressConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class SellerAddress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = SellerAddressConstants.COL_SELLER_PROFILE, nullable = false)
    @ToString.Exclude
    private SellerProfile sellerProfile;

    @Column(name = SellerAddressConstants.COL_ADDRESS_LINE1, nullable = false)
    private String addressLine1;

    @Column(name = SellerAddressConstants.COL_ADDRESS_LINE2)
    private String addressLine2;

    @Column(name = SellerAddressConstants.COL_CITY, nullable = false)
    private String city;

    @Column(name = SellerAddressConstants.COL_STATE, nullable = false)
    private String state;

    @Column(name = SellerAddressConstants.COL_COUNTRY, nullable = false)
    private String country;

    @Column(name = SellerAddressConstants.COL_ZIP_CODE, nullable = false)
    private String zipCode;

    @Column(name = SellerAddressConstants.COL_IS_WAREHOUSE)
    @Builder.Default
    private Boolean isWarehouse = false;
}