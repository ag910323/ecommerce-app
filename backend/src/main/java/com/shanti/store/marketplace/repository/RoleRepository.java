package com.shanti.store.marketplace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {

	Optional<Role> findByName(String name);

}
