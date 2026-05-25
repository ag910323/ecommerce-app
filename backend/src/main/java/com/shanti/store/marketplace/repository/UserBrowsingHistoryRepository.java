package com.shanti.store.marketplace.repository;

import com.shanti.store.marketplace.entity.UserBrowsingHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBrowsingHistoryRepository extends JpaRepository<UserBrowsingHistory, Long> {

    Optional<UserBrowsingHistory> findByUserIdAndProductId(Long userId, Long productId);

    List<UserBrowsingHistory> findTop10ByUserIdOrderByLastViewedAtDesc(Long userId);

    List<UserBrowsingHistory> findByUserIdOrderByLastViewedAtDesc(Long userId);
}