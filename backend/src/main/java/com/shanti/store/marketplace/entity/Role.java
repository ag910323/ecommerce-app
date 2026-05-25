package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.RoleEntityConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = RoleEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = {"permissions", "users"})

@SuppressWarnings("serial")
public class Role extends BaseEntity {

    @Column(name = RoleEntityConstants.COL_NAME, nullable = false, unique = true)
    private String name;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "role_permission",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    @ToString.Exclude
    private Set<Permission> permissions = new HashSet<>();

    @ManyToMany(mappedBy = "roles")
    @Builder.Default
    @ToString.Exclude
    private Set<User> users = new HashSet<>();
}
