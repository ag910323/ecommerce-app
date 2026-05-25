package com.shanti.store.marketplace.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.shanti.store.marketplace.entity.SellerAccount;

public interface SellerRepository extends JpaRepository<SellerAccount, Long> {

}
