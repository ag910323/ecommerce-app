package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.HomePageItemConstants;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = HomePageItemConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class HomePageItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = HomePageItemConstants.COL_SECTION_ID, nullable = false)
    @ToString.Exclude
    private HomePageSection section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = HomePageItemConstants.COL_PRODUCT_ID)
    @ToString.Exclude
    private Product product;

    @Column(name = HomePageItemConstants.COL_IMAGE_URL)
    private String imageUrl;

    @Column(name = HomePageItemConstants.COL_TITLE)
    private String title;

    @Column(name = HomePageItemConstants.COL_DESCRIPTION)
    private String description;

    @Column(name = HomePageItemConstants.COL_LINK)
    private String link;

    @Column(name = HomePageItemConstants.COL_DISPLAY_ORDER)
    private Integer displayOrder;
}
