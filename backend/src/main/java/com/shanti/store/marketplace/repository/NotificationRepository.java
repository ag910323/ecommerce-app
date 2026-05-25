package com.shanti.store.marketplace.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.shanti.store.marketplace.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserId(Long userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(Long userId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsRead(@Param("id") Long id);
}