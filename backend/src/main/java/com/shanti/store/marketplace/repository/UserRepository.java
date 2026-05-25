package com.shanti.store.marketplace.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
	Optional<User> findByEmail(String email);
}
