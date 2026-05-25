package com.shanti.store.marketplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

}
