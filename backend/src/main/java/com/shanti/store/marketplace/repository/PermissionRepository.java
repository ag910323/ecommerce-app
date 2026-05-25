package com.shanti.store.marketplace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long> {

	boolean existsByName(String name);

	Optional<Permission> findByName(String name);

}
