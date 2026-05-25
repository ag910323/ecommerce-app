package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.CartItemEntityConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = CartItemEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class CartItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = CartItemEntityConstants.COL_CART, nullable = false)
    @ToString.Exclude
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;
    
    @Column(name = CartItemEntityConstants.COL_QUANTITY, nullable = false)
    private int quantity;

    @Column(name = CartItemEntityConstants.COL_PRICE, nullable = false)
    private BigDecimal price; // store price at the time of adding to cart
}
