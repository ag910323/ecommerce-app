package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.ProductImageEntityConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = ProductImageEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class ProductImage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = ProductImageEntityConstants.COL_PRODUCT, nullable = false)
    @ToString.Exclude
    private Product product;

    @Column(name = ProductImageEntityConstants.COL_IMAGE_URL, nullable = false)
    private String imageUrl;

    @Column(name = ProductImageEntityConstants.COL_ALT_TEXT)
    private String altText;

    @Column(name = ProductImageEntityConstants.COL_ORDER)
    private Integer order;
}
