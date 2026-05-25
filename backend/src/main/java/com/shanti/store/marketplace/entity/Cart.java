package com.shanti.store.marketplace.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.shanti.store.marketplace.constants.CartEntityConstants;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = CartEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class Cart extends BaseEntity {
    
	@ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = CartEntityConstants.MAPPED_BY_CART_ITEMS, 
               cascade = CascadeType.ALL, 
               orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @Builder.Default
    private List<CartItem> cartItems = new ArrayList<>();
    
    @Builder.Default
    @Column(name = CartEntityConstants.COL_TOTAL_ITEMS)
    private int totalItems = 0;

    @Builder.Default
    @Column(name = CartEntityConstants.COL_TOTAL_SELLING_PRICE)
    private BigDecimal totalSellingPrice = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = CartEntityConstants.COL_TOTAL_MRP)
    private BigDecimal totalMRP = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = CartEntityConstants.COL_TOTAL_DISCOUNT)
    private BigDecimal totalDiscount = BigDecimal.ZERO;


}
