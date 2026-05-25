package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.enums.OrderStatus;
import com.shanti.store.marketplace.enums.PaymentMode;
import com.shanti.store.marketplace.enums.PaymentStatus;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.repository.PaymentRepository;
import com.shanti.store.marketplace.service.InventoryService;
import com.shanti.store.marketplace.service.OrderStatusService;
import com.shanti.store.marketplace.service.PaymentService;
import com.shanti.store.marketplace.service.TransactionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final InventoryService inventoryService;
    private final PaymentRepository paymentRepository;
    private final TransactionService transactionService;
    private final OrderStatusService orderStatusService;

    // ✅ STEP 1: CREATE PAYMENT
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public Payment createPayment(Order order, PaymentMode mode) {

        Payment payment = Payment.builder()
                .order(order)
                .amount(order.getTotalPrice())
                .paidAmount(BigDecimal.ZERO)
                .refundedAmount(BigDecimal.ZERO)
                .paymentMethod(mode)
                .status(mode == PaymentMode.CASH_ON_DELIVERY
                        ? PaymentStatus.PENDING
                        : PaymentStatus.CREATED)
                .currency(order.getCurrency())
                .build();

        order.getPayments().add(payment);

        return payment;
    }

    // ✅ STEP 2: SUCCESS (online / COD collection later)
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void markPaymentSuccess(Payment payment, String gatewayPaymentId) {

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setGatewayPaymentId(gatewayPaymentId);
        payment.setPaidAt(LocalDateTime.now());
        payment.setPaidAmount(payment.getAmount());
        
        Order order = payment.getOrder();

        transactionService.handlePaymentSuccess(order, payment);

        orderStatusService.updateOrderStatus(order);
    }

    // ❌ STEP 3: FAILURE
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void markPaymentFailed(Payment payment, String reason) {

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);

        Order order = payment.getOrder();
        order.setStatus(OrderStatus.CANCELLED);

        // restore stock
        inventoryService.restoreStock(order);
    }

    // 💸 STEP 4: REFUND (partial/full)
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void processRefund(Payment payment, BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        BigDecimal paidAmount = payment.getPaidAmount() != null
                ? payment.getPaidAmount()
                : BigDecimal.ZERO;

        // 🔥 CRITICAL FIX
        if (paidAmount.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }
        
        BigDecimal currentRefunded = payment.getRefundedAmount() != null
                ? payment.getRefundedAmount()
                : BigDecimal.ZERO;

        BigDecimal newRefundTotal = currentRefunded.add(amount);

        payment.setRefundedAmount(newRefundTotal);
        payment.setRefundedAt(LocalDateTime.now());

        if (newRefundTotal.compareTo(paidAmount) >= 0) {
            payment.setStatus(PaymentStatus.REFUNDED);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
        }
    }

    // 🧠 STEP 5: DERIVE STATUS (IMPORTANT)
    @Override
    public PaymentStatus derivePaymentStatus(Order order) {

        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal totalRefunded = BigDecimal.ZERO;

        for (Payment p : order.getPayments()) {
            totalPaid = totalPaid.add(
                    p.getPaidAmount() != null ? p.getPaidAmount() : BigDecimal.ZERO
            );

            totalRefunded = totalRefunded.add(
                    p.getRefundedAmount() != null ? p.getRefundedAmount() : BigDecimal.ZERO
            );
        }

        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            return PaymentStatus.PENDING;
        }

        if (totalRefunded.compareTo(BigDecimal.ZERO) == 0) {
            return PaymentStatus.SUCCESS;
        }

        if (totalRefunded.compareTo(totalPaid) >= 0) {
            return PaymentStatus.REFUNDED;
        }

        return PaymentStatus.PARTIALLY_REFUNDED;
    }

    // 🔁 EXISTING HELPER (kept)
    @Override
    public PaymentMode mapPaymentMethod(String method) {

        if (method == null) {
            throw new RuntimeException("Payment method required");
        }

        switch (method.toUpperCase()) {
            case "COD":
            case "CASH_ON_DELIVERY":
                return PaymentMode.CASH_ON_DELIVERY;

            case "ONLINE":
                return PaymentMode.ONLINE;

            default:
                throw new RuntimeException("Invalid payment method");
        }
    }
    
    @Transactional
    public void confirmOnlinePayment(String gatewayOrderId,
                                     String gatewayPaymentId,
                                     String signature) {

        Payment payment = paymentRepository
                .findByGatewayOrderId(gatewayOrderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        markPaymentSuccess(payment, gatewayPaymentId);
    }
    
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void handlePostShipmentRejection(Order order, Payment payment) {

        if (payment == null) return;

        BigDecimal totalPaid = getTotalPaid(order);

        // 🔥 If nothing collected → nothing to refund
        if (totalPaid.compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        BigDecimal totalRejectedAmount = order.getShipments().stream()
                .filter(s -> s.getStatus() == ShipmentStatus.REJECTED)
                .map(Shipment::getFinalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRefunded = getTotalRefunded(order);

        BigDecimal refundDelta = totalRejectedAmount.subtract(totalRefunded);

        if (refundDelta.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }

        processRefund(payment, refundDelta);
    }
    
    @Override
    public BigDecimal getTotalPaid(Order order) {
        return order.getPayments().stream()
                .filter(p -> p.getStatus() == PaymentStatus.SUCCESS)
                .map(p -> p.getPaidAmount() != null ? p.getPaidAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public BigDecimal getTotalRefunded(Order order) {
        return order.getPayments().stream()
                .filter(p ->
                        p.getStatus() == PaymentStatus.REFUNDED ||
                        p.getStatus() == PaymentStatus.PARTIALLY_REFUNDED
                )
                .map(p -> p.getRefundedAmount() != null ? p.getRefundedAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public BigDecimal getRemainingAmount(Order order) {
        BigDecimal totalOrderAmount = order.getTotalPrice();
        BigDecimal paid = getTotalPaid(order);
        BigDecimal refunded = getTotalRefunded(order);

        return totalOrderAmount.subtract(paid).add(refunded);
    }
    
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public void markCODCollected(Payment payment, BigDecimal actualCollected) {

        payment.setPaidAt(LocalDateTime.now());
        payment.setPaidAmount(actualCollected);

        BigDecimal orderTotal = payment.getOrder().getTotalPrice() != null
                ? payment.getOrder().getTotalPrice()
                : BigDecimal.ZERO;

        if (actualCollected.compareTo(orderTotal) >= 0) {
            payment.setStatus(PaymentStatus.SUCCESS);
        } else {
            payment.setStatus(PaymentStatus.PARTIALLY_PAID);
        }
    }
    
    @Override
    @Transactional
    public void handleShipmentDelivered(Order order, Shipment shipment) {

        Payment payment = getLatestPayment(order);

        if (payment == null) return;

        // ✅ COD handling
        if (payment.getPaymentMethod() == PaymentMode.CASH_ON_DELIVERY) {

            BigDecimal shipmentAmount = shipment.getFinalAmount() != null
                    ? shipment.getFinalAmount()
                    : BigDecimal.ZERO;

            BigDecimal alreadyPaid = payment.getPaidAmount() != null
                    ? payment.getPaidAmount()
                    : BigDecimal.ZERO;

            BigDecimal newPaidAmount = alreadyPaid.add(shipmentAmount);

            payment.setPaidAmount(newPaidAmount);

            // ✅ mark success if fully paid
            if (newPaidAmount.compareTo(payment.getAmount()) >= 0) {
                payment.setStatus(PaymentStatus.SUCCESS);
            }

            paymentRepository.save(payment);
        }

        transactionService.handleShipmentDeliveryTransactions(shipment, payment);
    }
    
    private Payment getLatestPayment(Order order) {

        if (order.getPayments() == null || order.getPayments().isEmpty()) {
            return null;
        }

        return order.getPayments().stream()
                .max(Comparator.comparing(Payment::getCreatedAt))
                .orElse(null);
    }
}