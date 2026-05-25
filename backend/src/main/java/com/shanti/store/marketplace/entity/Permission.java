package com.shanti.store.marketplace.entity;

import com.shanti.store.marketplace.constants.PermissionEntityConstants;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = PermissionEntityConstants.TABLE_NAME)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = true, exclude = "roles")

@SuppressWarnings("serial")
public class Permission extends BaseEntity {

    @Column(name = PermissionEntityConstants.COL_NAME, nullable = false, unique = true)
    private String name;

    @ManyToMany(mappedBy = "permissions")
    @Builder.Default
    @ToString.Exclude
    private Set<Role> roles = new HashSet<>();
}
