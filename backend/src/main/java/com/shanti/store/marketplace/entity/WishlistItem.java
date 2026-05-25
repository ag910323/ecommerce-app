package com.shanti.store.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import com.shanti.store.marketplace.constants.WishlistItemConstants;

import java.time.LocalDateTime;

@Entity
@Table(name = WishlistItemConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class WishlistItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = WishlistItemConstants.COL_WISHLIST, nullable = false)
    @ToString.Exclude
    private Wishlist wishlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = WishlistItemConstants.COL_PRODUCT, nullable = false)
    @ToString.Exclude
    private Product product;

    @Column(name = WishlistItemConstants.COL_ADDED_DATE, nullable = false)
    private LocalDateTime addedDate;
}
