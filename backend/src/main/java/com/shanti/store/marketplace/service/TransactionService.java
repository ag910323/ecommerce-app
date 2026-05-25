package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.Shipment;

public interface TransactionService {
	
	void handlePaymentSuccess(Order order, Payment payment);

    void handleShipmentRejection(Shipment shipment, Payment payment);
    
    void handleShipmentDeliveryTransactions(Shipment shipment, Payment payment);
}