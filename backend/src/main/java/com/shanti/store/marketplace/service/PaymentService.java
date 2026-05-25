package com.shanti.store.marketplace.service;

import java.math.BigDecimal;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.enums.PaymentMode;
import com.shanti.store.marketplace.enums.PaymentStatus;

public interface PaymentService {

    Payment createPayment(Order order, PaymentMode mode);

    void markPaymentSuccess(Payment payment, String gatewayPaymentId);

    void markPaymentFailed(Payment payment, String reason);

    void processRefund(Payment payment, BigDecimal amount);

    PaymentStatus derivePaymentStatus(Order order);

    PaymentMode mapPaymentMethod(String method);
    
    void confirmOnlinePayment(String gatewayOrderId, String gatewayPaymentId, String signature);

    void handlePostShipmentRejection(Order order, Payment payment);

    BigDecimal getTotalPaid(Order order);

    BigDecimal getTotalRefunded(Order order);

    BigDecimal getRemainingAmount(Order order);
    
    void markCODCollected(Payment payment, BigDecimal actualCollected);
    
    void handleShipmentDelivered(Order order, Shipment shipment);
}