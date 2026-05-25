package com.shanti.store.marketplace.entity;

import java.util.ArrayList;
import java.util.List;

import com.shanti.store.marketplace.constants.CategoryEntityConstants;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(
	    name = CategoryEntityConstants.TABLE_NAME,
	    uniqueConstraints = {
	        @UniqueConstraint(name = "unique_name_per_parent", columnNames = {"name", "parent_id"})
	    }
	)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class Category extends BaseEntity {

    @Column(name = CategoryEntityConstants.COL_NAME, nullable = false, length = CategoryEntityConstants.LENGTH_NAME)
    private String name;

    @Column(name = CategoryEntityConstants.COL_DESCRIPTION, length = CategoryEntityConstants.LENGTH_DESCRIPTION)
    private String description;

    @Column(name = CategoryEntityConstants.COL_STATUS)
    private String status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = CategoryEntityConstants.COL_PARENT_CATEGORY)
    @ToString.Exclude
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Category> subCategories = new ArrayList<>();

    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @Builder.Default
    private List<Product> products = new ArrayList<>();
}
