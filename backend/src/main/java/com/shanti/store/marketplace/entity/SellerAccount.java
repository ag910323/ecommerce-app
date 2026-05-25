package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.shanti.store.marketplace.constants.SellerEntityConstants;
import com.shanti.store.marketplace.enums.SellerStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = SellerEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class SellerAccount extends BaseEntity {

	@Column(name = SellerEntityConstants.COL_NAME, nullable = false)
	private String name;
	
	@OneToOne(mappedBy = "sellerAccount", cascade = CascadeType.ALL)
	@ToString.Exclude
	private SellerProfile sellerProfile;
	
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id", nullable = false)
	@ToString.Exclude
	private User user;
	
	@OneToMany(mappedBy = "sellerAccount", cascade = CascadeType.ALL, orphanRemoval = true)
	@ToString.Exclude
	@Builder.Default
	private List<Review> reviews = new ArrayList<>();
	
	@OneToMany(mappedBy = "sellerAccount", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Product> products = new ArrayList<>();
	
	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false)
	private SellerStatus status;

	private Boolean freeShipping;

    private BigDecimal flatShippingCharge;

    private BigDecimal freeShippingAbove;

    private String warehousePincode;
	
}
