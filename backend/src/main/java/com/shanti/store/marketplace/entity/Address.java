package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.AddressEntityConstants;
import com.shanti.store.marketplace.enums.AddressType;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = AddressEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class Address extends BaseEntity {

    @Column(name = AddressEntityConstants.COL_STREET, nullable = false)
    private String street;

    @Column(name = AddressEntityConstants.COL_CITY, nullable = false)
    private String city;

    @Column(name = AddressEntityConstants.COL_STATE, nullable = false)
    private String state;

    @Column(name = AddressEntityConstants.COL_COUNTRY, nullable = false)
    private String country;

    @Column(name = AddressEntityConstants.COL_ZIP_CODE, nullable = false)
    private String zipCode;

    // ✅ NEW FIELDS

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "landmark")
    private String landmark;

    @Enumerated(EnumType.STRING)
    @Column(name = "address_type")
    private AddressType addressType;

    @Column(name = "is_default")
    private Boolean isDefault;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = AddressEntityConstants.COL_USER, nullable = false)
    @ToString.Exclude
    private User user;
}
