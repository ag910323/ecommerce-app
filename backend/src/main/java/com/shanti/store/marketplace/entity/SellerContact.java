package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.SellerContactConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = SellerContactConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class SellerContact extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = SellerContactConstants.COL_SELLER_PROFILE, nullable = false)
    @ToString.Exclude
    private SellerProfile sellerProfile;

    @Column(name = SellerContactConstants.COL_PHONE, nullable = false)
    private String phone;

    @Column(name = SellerContactConstants.COL_EMAIL)
    private String email;

    @Column(name = SellerContactConstants.COL_ALTERNATE_PHONE)
    private String alternatePhone;

    @Column(name = SellerContactConstants.COL_SUPPORT_CONTACT)
    private String supportContact;
}
