package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.Transaction;
import com.shanti.store.marketplace.enums.OrderStatus;
import com.shanti.store.marketplace.enums.PaymentMode;
import com.shanti.store.marketplace.enums.PaymentStatus;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.enums.TransactionStatus;
import com.shanti.store.marketplace.enums.TransactionType;
import com.shanti.store.marketplace.exception.EntityNotFoundException;
import com.shanti.store.marketplace.mapper.OrderMapper;
import com.shanti.store.marketplace.mapper.ShipmentMapper;
import com.shanti.store.marketplace.repository.OrderRepository;
import com.shanti.store.marketplace.request.BuyNowRequest;
import com.shanti.store.marketplace.request.CheckoutRequest;
import com.shanti.store.marketplace.request.OrderStatusHistoryRequest;
import com.shanti.store.marketplace.request.SellerActionRequest;
import com.shanti.store.marketplace.request.UpdateShipmentStatusRequest;
import com.shanti.store.marketplace.response.OrderResponse;
import com.shanti.store.marketplace.response.OrderSummaryResponse;
import com.shanti.store.marketplace.response.ShipmentResponse;
import com.shanti.store.marketplace.service.CartService;
import com.shanti.store.marketplace.service.NotificationService;
import com.shanti.store.marketplace.service.OrderBuilderService;
import com.shanti.store.marketplace.service.OrderService;
import com.shanti.store.marketplace.service.OrderStatusHistoryService;
import com.shanti.store.marketplace.service.OrderStatusService;
import com.shanti.store.marketplace.service.PaymentService;
import com.shanti.store.marketplace.service.ShipmentService;
import com.shanti.store.marketplace.service.ShippingService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final NotificationService notificationService;
    private final ShippingService shippingService;
    private final OrderStatusHistoryService orderStatusHistoryService;
    private final OrderBuilderService orderBuilderService;
    private final ShipmentService shipmentService;
    private final PaymentService paymentService;
    private final CartService cartService;
    private final OrderStatusService orderStatusService;
    
    @Override
    @Transactional(readOnly = true)
    public OrderResponse previewBuyNow(BuyNowRequest request) {
        return OrderMapper.toResponse(orderBuilderService.buildBuyNowOrder(request, false));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse previewCheckout(CheckoutRequest request) {
        return OrderMapper.toResponse(orderBuilderService.buildCheckoutOrder(request, false));
    }
    
    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderForSeller(Long orderId, Long sellerId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        boolean belongsToSeller = order.getShipments().stream()
                .anyMatch(s -> s.getSellerAccount().getId().equals(sellerId));

        if (!belongsToSeller) {
            throw new RuntimeException("Unauthorized");
        }

        return OrderMapper.toResponse(order, sellerId);
    }
    
    @Override
    @Transactional
    public OrderResponse buyNow(BuyNowRequest request) {

        Order order = orderBuilderService.buildBuyNowOrder(request, true);
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        order.setStatus(OrderStatus.CREATED);
        
        PaymentMode mode = paymentService.mapPaymentMethod(request.getPaymentMethod());
        paymentService.createPayment(order, mode);
        
        Order savedOrder = orderRepository.saveAndFlush(order);
        orderStatusHistoryService.record(
                OrderStatusHistoryRequest.builder()
                        .orderId(savedOrder.getId())
                        .userId(savedOrder.getUser().getId())
                        .oldStatus(OrderStatus.CREATED)
                        .newStatus(savedOrder.getStatus())
                        .changedBy("SYSTEM")
                        .build()
        );

        notificationService.sendOrderNotification(savedOrder);

        return OrderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {

        Order order = orderBuilderService.buildCheckoutOrder(request, true);
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        order.setStatus(OrderStatus.CREATED);
        
        PaymentMode mode = paymentService.mapPaymentMethod(request.getPaymentMethod());
        paymentService.createPayment(order, mode);
        
        Order savedOrder = orderRepository.saveAndFlush(order);
        orderStatusHistoryService.record(
                OrderStatusHistoryRequest.builder()
                        .orderId(savedOrder.getId())
                        .userId(savedOrder.getUser().getId())
                        .oldStatus(OrderStatus.CREATED)
                        .newStatus(savedOrder.getStatus())
                        .changedBy("SYSTEM")
                        .build()
        );

        notificationService.sendOrderNotification(savedOrder);

        cartService.clearCart(savedOrder.getUser());

        return OrderMapper.toResponse(savedOrder);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUser(Long userId) {

        return orderRepository.findByUserId(userId)
                .stream()
                .map(OrderMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found"));

        return OrderMapper.toResponse(order);
    }

	@Override
	@Transactional(readOnly = true)
	public List<OrderResponse> getOrdersBySeller(Long sellerId) {

	    List<Order> orders = orderRepository.findOrdersBySellerId(sellerId);

	    return orders.stream()
	            .map(order -> OrderMapper.toResponse(order, sellerId)) 
	            .collect(Collectors.toList());
	}
	
	@Override
	@Transactional
	public OrderResponse cancelOrder(Long orderId, Long userId) {

	    Order order = orderRepository.findById(orderId)
	            .orElseThrow(() -> new RuntimeException("Order not found"));

	    // ✅ AUTH FIRST
	    if (!order.getUser().getId().equals(userId)) {
	        throw new RuntimeException("Unauthorized");
	    }

	    if (order.getStatus() == OrderStatus.CANCELLED) {
	        throw new RuntimeException("Order already cancelled");
	    }
	    
	    Payment payment = getLatestPayment(order);

	    boolean allRejected = order.getShipments().stream()
	            .allMatch(s -> s.getStatus() == ShipmentStatus.REJECTED);

	    OrderStatus oldOrderStatus = order.getStatus();
	    
	    // ✅ IDEMPOTENT CASE
	    if (allRejected) {

	    	if (payment != null &&
	    	        payment.getPaymentMethod() == PaymentMode.CASH_ON_DELIVERY) {
	    	        payment.setStatus(PaymentStatus.CANCELLED);
	    	} else {
	    		if (payment != null) {
	    			BigDecimal totalPaid = paymentService.getTotalPaid(order);
		    		BigDecimal totalRefunded = paymentService.getTotalRefunded(order);

		    		BigDecimal remainingToRefund = totalPaid.subtract(totalRefunded);

		    		if (remainingToRefund.compareTo(BigDecimal.ZERO) > 0) {
		    		    paymentService.processRefund(payment, remainingToRefund);
		    		}
	    		}	    		
	    	}
	        order.setStatus(OrderStatus.CANCELLED);
	        orderRepository.save(order);

	        orderStatusHistoryService.record(
	                OrderStatusHistoryRequest.builder()
	                        .orderId(order.getId())
	                        .userId(order.getUser().getId())
	                        .oldStatus(oldOrderStatus)
	                        .newStatus(order.getStatus())
	                        .changedBy("USER_" + userId)
	                        .build()
	        );
	        
	        notificationService.sendCancelNotification(order);

	        return OrderMapper.toResponse(order);
	    }

	    boolean isShipped = order.getShipments().stream()
	            .anyMatch(s ->
	                    s.getStatus() == ShipmentStatus.SHIPPED ||
	                    s.getStatus() == ShipmentStatus.IN_TRANSIT ||
	                    s.getStatus() == ShipmentStatus.OUT_FOR_DELIVERY ||
	                    s.getStatus() == ShipmentStatus.DELIVERED
	            );

	    if (isShipped) {
	        throw new RuntimeException("Cannot cancel shipped order");
	    }

	    order.getShipments().forEach(shipment ->
	            shipmentService.processShipmentRejection(shipment, payment)
	    );

	    paymentService.handlePostShipmentRejection(order, payment);
	    
	    orderStatusService.updateOrderStatus(order);

	    orderRepository.save(order);

	    orderStatusHistoryService.record(
	    	    OrderStatusHistoryRequest.builder()
	    	        .orderId(order.getId())
	    	        .userId(order.getUser().getId())
	    	        .oldStatus(oldOrderStatus)
	    	        .newStatus(order.getStatus())
	            .changedBy("USER_" + userId)
	            .build()
	    );
	    notificationService.sendCancelNotification(order);

	    return OrderMapper.toResponse(order);
	}
	
	@Override
	@Transactional
	public ShipmentResponse handleSellerAction(Long shipmentId, SellerActionRequest request) {
		return shipmentService.handleSellerAction(shipmentId, request);
	}
	
	@Override
	@Transactional
	public ShipmentResponse updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request) {
		return shipmentService.updateShipmentStatus(shipmentId, request);
	}
	
	@Override
	@Transactional(readOnly = true)
	public List<ShipmentResponse> getShipmentsBySeller(Long sellerId) {

	    return shippingService.findBySellerAccountIdOrderByCreatedAtDesc(sellerId)
	            .stream()
	            .map(ShipmentMapper::toResponse)
	            .collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public OrderSummaryResponse getOrderSummary(Long orderId) {
	    Order order = orderRepository.findById(orderId)
	        .orElseThrow(() -> new RuntimeException("Order not found"));
	    BigDecimal refunded = order.getShipments().stream()
	    	    .flatMap(s -> s.getTransactions().stream())
	    	    .filter(txn ->
	    	    txn.getType() == TransactionType.DEBIT &&
	    	    txn.getStatus() == TransactionStatus.COMPLETED
	    	)
	    	    .map(Transaction::getAmount)
	    	    .reduce(BigDecimal.ZERO, BigDecimal::add);
	    return new OrderSummaryResponse(
	        order.getId(),
	        order.getOrderNumber(),
	        order.getTotalPrice(),
	        order.getStatus(),
	        refunded
	    );
	}

	@Override
	@Transactional(readOnly = true)
	public Page<OrderResponse> getOrdersByUser(Long userId, int page, int size) {
	    Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());

	    return orderRepository.findByUserId(userId, pageable)
	            .map(OrderMapper::toResponse);
	}
	
	private Payment getLatestPayment(Order order) {
	    return order.getPayments().stream()
	            .filter(p -> p.getCreatedAt() != null)
	            .max(Comparator.comparing(Payment::getCreatedAt))
	            .orElseThrow(() -> new RuntimeException("Payment not found"));
	}
	
}
