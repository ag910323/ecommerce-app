package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.entity.CartItem;
import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.ProductVariant;
import com.shanti.store.marketplace.entity.Shipment;

public interface InventoryService {

    void validateAndReduceStock(ProductVariant variant, int quantity);

    void validateAndReduceStock(List<CartItem> cartItems);

    void restoreStock(Order order);
    
    void restoreStockForShipment(Shipment shipment);
}