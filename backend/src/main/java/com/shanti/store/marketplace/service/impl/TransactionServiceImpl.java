package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.entity.Transaction;
import com.shanti.store.marketplace.enums.PaymentStatus;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.enums.TransactionStatus;
import com.shanti.store.marketplace.enums.TransactionType;
import com.shanti.store.marketplace.service.TransactionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void handleShipmentRejection(Shipment shipment, Payment payment) {

        if (shipment.getStatus() != ShipmentStatus.REJECTED) {
            shipment.setStatus(ShipmentStatus.REJECTED);
        }

        if (shipment.getTransactions() == null) {
            shipment.setTransactions(new ArrayList<>());
        }
        
        if (payment != null &&
            payment.getPaidAmount() != null &&
            payment.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {

            boolean exists = shipment.getTransactions().stream()
                    .anyMatch(t ->
                            t.getType() == TransactionType.DEBIT &&
                            t.getPayment() != null &&
                            Objects.equals(t.getPayment().getId(), payment.getId())
                    );

            if (!exists) {
                Transaction txn = Transaction.builder()
                        .sellerAccount(shipment.getSellerAccount())
                        .shipment(shipment)
                        .payment(payment)
                        .amount(shipment.getFinalAmount().negate())
                        .type(TransactionType.DEBIT)
                        .status(TransactionStatus.COMPLETED)
                        .timestamp(LocalDateTime.now())
                        .build();

                shipment.getTransactions().add(txn);
            }
        }
    }

    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void handlePaymentSuccess(Order order, Payment payment) {

        if (payment.getStatus() != PaymentStatus.SUCCESS) return;

        for (Shipment shipment : order.getShipments()) {

            // ❌ skip rejected
            if (shipment.getStatus() == ShipmentStatus.REJECTED) continue;

            // ✅ only valid lifecycle
            if (shipment.getStatus() != ShipmentStatus.SHIPPED &&
                shipment.getStatus() != ShipmentStatus.DELIVERED) {
                continue;
            }

            createCreditIfNotExists(shipment, payment);
        }
    }
    
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void handleShipmentDeliveryTransactions(Shipment shipment, Payment payment) {

        if (payment == null) return;

        if (payment.getStatus() == PaymentStatus.FAILED) return;
        if (shipment.getStatus() == ShipmentStatus.REJECTED) return;

        if (shipment.getTransactions() == null) {
            shipment.setTransactions(new ArrayList<>());
        }

        // ✅ COD case → transaction may not exist yet → create
        createCreditIfNotExists(shipment, payment);

        // ✅ COMPLETE only for this payment
        shipment.getTransactions().forEach(txn -> {
            if (txn.getType() == TransactionType.CREDIT &&
                txn.getStatus() == TransactionStatus.PENDING &&
                txn.getPayment() != null &&
                Objects.equals(txn.getPayment().getId(), payment.getId())) {

                txn.setStatus(TransactionStatus.COMPLETED);
            }
        });
    }

    private void createCreditIfNotExists(Shipment shipment, Payment payment) {

    	if (shipment.getTransactions() == null) {
    	    shipment.setTransactions(new ArrayList<>());
    	}
    	
        boolean exists = shipment.getTransactions().stream()
                .anyMatch(t ->
                        t.getType() == TransactionType.CREDIT &&
                        t.getPayment() != null &&
                        Objects.equals(t.getPayment().getId(), payment.getId())
                );

        if (exists) return;

        Transaction txn = Transaction.builder()
                .sellerAccount(shipment.getSellerAccount())
                .shipment(shipment)
                .payment(payment)
                .amount(shipment.getFinalAmount())
                .type(TransactionType.CREDIT)
                .status(TransactionStatus.PENDING)
                .timestamp(LocalDateTime.now())
                .build();

        shipment.getTransactions().add(txn);
    }
}