package com.shanti.store.marketplace.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_browsing_history",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"user_id", "product_id"})
        },
        indexes = {
                @Index(name = "idx_user_time", columnList = "user_id, lastViewedAt")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserBrowsingHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Builder.Default
    @Column(nullable = false)
    private Integer viewCount = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer clickCount = 0;

    @Column(nullable = false)
    private LocalDateTime lastViewedAt;

    @Column(length = 50)
    private String source;
}