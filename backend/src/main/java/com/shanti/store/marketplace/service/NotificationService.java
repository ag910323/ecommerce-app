package com.shanti.store.marketplace.service;

import org.springframework.data.domain.Page;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.request.NotificationRequest;
import com.shanti.store.marketplace.request.PaginationRequest;
import com.shanti.store.marketplace.response.NotificationResponse;

public interface NotificationService {

    void markAsRead(Long notificationId);

    long getUnreadCount(Long userId);

    void createNotification(NotificationRequest request);

    Page<NotificationResponse> getUserNotifications(Long userId, PaginationRequest request);

    void sendOrderNotification(Order order);
    
    void sendCancelNotification(Order order);
}