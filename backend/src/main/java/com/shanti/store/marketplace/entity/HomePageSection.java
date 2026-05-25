package com.shanti.store.marketplace.entity;

import java.util.ArrayList;
import java.util.List;

import com.shanti.store.marketplace.constants.HomePageSectionConstants;
import com.shanti.store.marketplace.enums.SectionType;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = HomePageSectionConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class HomePageSection extends BaseEntity {

    @Column(name = HomePageSectionConstants.COL_TITLE, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = HomePageSectionConstants.COL_SECTION_TYPE, nullable = false)
    private SectionType sectionType;

    @Column(name = HomePageSectionConstants.COL_DISPLAY_ORDER)
    private Integer displayOrder;

    @OneToMany(mappedBy = "section", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<HomePageItem> items = new ArrayList<>();
}
