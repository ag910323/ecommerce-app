package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.BannerConstants;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = BannerConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class Banner extends BaseEntity {

    @Column(name = BannerConstants.COL_TITLE)
    private String title;

    @Column(name = BannerConstants.COL_IMAGE_URL, nullable = false)
    private String imageUrl;

    @Column(name = BannerConstants.COL_LINK)
    private String link;

    @Column(name = BannerConstants.COL_DISPLAY_ORDER)
    private Integer displayOrder;

    @Builder.Default
    @Column(name = BannerConstants.COL_ACTIVE)
    private Boolean active = true;
}
