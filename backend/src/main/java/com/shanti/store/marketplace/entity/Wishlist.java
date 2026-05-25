package com.shanti.store.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import com.shanti.store.marketplace.constants.WishlistConstants;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = WishlistConstants.TABLE_NAME,
uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "is_default"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder


@SuppressWarnings("serial")
public class Wishlist extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = WishlistConstants.COL_USER, nullable = false)
    @ToString.Exclude
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 255)
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "wishlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<WishlistItem> items = new ArrayList<>();
    
    @Column(nullable = false)
    @Builder.Default
    private boolean isDefault = false;
}

