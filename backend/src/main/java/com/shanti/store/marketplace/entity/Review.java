package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.ReviewConstants;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = ReviewConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class Review extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = ReviewConstants.COL_PRODUCT)
    @ToString.Exclude
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = ReviewConstants.COL_SELLER)
    @ToString.Exclude
    private SellerAccount sellerAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = ReviewConstants.COL_USER, nullable = false)
    @ToString.Exclude
    private User user;

    @Column(name = ReviewConstants.COL_RATING, nullable = false)
    private Double rating;

    @Column(name = ReviewConstants.COL_COMMENT, length = 1000)
    private String comment;

}
