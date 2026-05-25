package com.shanti.store.marketplace.enums;

public enum ShipmentStatus {
    CREATED,        // Order placed
    ACCEPTED,       // Seller accepted
    REJECTED,       // Seller rejected
    READY_TO_SHIP,  // Packed
    SHIPPED,        // Dispatched
    IN_TRANSIT,
    OUT_FOR_DELIVERY,
    DELIVERED
//    CANCELLED       // System/User cancel
}