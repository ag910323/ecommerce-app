package com.shanti.store.marketplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Long> {

}
