package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.enums.OrderStatus;

public interface OrderStatusService {
    
    OrderStatus deriveOrderStatus(Order order);
    
    void updateOrderStatus(Order order);
    
}