package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.SellerProfileConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = SellerProfileConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class SellerProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = SellerProfileConstants.COL_SELLER, nullable = false)
    @ToString.Exclude
    private SellerAccount sellerAccount;

    @Column(name = SellerProfileConstants.COL_BUSINESS_NAME, nullable = false)
    private String businessName;

    @Column(name = SellerProfileConstants.COL_GST_NUMBER, nullable = false)
    private String gstNumber;

    @Column(name = SellerProfileConstants.COL_REGISTRATION_DATE)
    private LocalDate registrationDate;

    @OneToMany(mappedBy = "sellerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<SellerContact> contacts = new ArrayList<>();

    @OneToMany(mappedBy = "sellerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<SellerAddress> addresses = new ArrayList<>();

    @OneToMany(mappedBy = "sellerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<SellerBankDetail> bankDetails = new ArrayList<>();

    @OneToMany(mappedBy = "sellerProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<SellerDocument> documents = new ArrayList<>();

}
