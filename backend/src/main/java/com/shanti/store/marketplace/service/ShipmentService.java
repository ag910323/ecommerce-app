package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.OrderItem;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.request.SellerActionRequest;
import com.shanti.store.marketplace.request.UpdateShipmentStatusRequest;
import com.shanti.store.marketplace.response.ShipmentResponse;

public interface ShipmentService {

    ShipmentResponse updateShipmentStatus(Long shipmentId, String status);
    
    Shipment createShipment(Order order, SellerAccount seller, List<OrderItem> items, Address addressEntity);

    ShipmentResponse handleSellerAction(Long shipmentId, SellerActionRequest request);
    
    void processShipmentRejection(Shipment shipment, Payment payment);

    void validateShipmentTransition(ShipmentStatus current, ShipmentStatus next);
    
    ShipmentResponse updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request);
    
}