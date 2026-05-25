package com.shanti.store.marketplace.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.entity.Wishlist;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long>, JpaSpecificationExecutor<Wishlist> {
    List<Wishlist> findAllByUser(User user);

	Optional<Wishlist> findByUserAndIsDefaultTrue(User user);
}

