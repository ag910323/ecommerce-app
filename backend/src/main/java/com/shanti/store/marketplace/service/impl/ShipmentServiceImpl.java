package com.shanti.store.marketplace.service.impl;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Address;
import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.OrderItem;
import com.shanti.store.marketplace.entity.Payment;
import com.shanti.store.marketplace.entity.SellerAccount;
import com.shanti.store.marketplace.entity.Shipment;
import com.shanti.store.marketplace.enums.NotificationType;
import com.shanti.store.marketplace.enums.OrderStatus;
import com.shanti.store.marketplace.enums.ReferenceType;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.exception.EntityNotFoundException;
import com.shanti.store.marketplace.mapper.ShipmentMapper;
import com.shanti.store.marketplace.repository.OrderRepository;
import com.shanti.store.marketplace.repository.ShipmentRepository;
import com.shanti.store.marketplace.request.NotificationRequest;
import com.shanti.store.marketplace.request.OrderStatusHistoryRequest;
import com.shanti.store.marketplace.request.SellerActionRequest;
import com.shanti.store.marketplace.request.ShipmentStatusHistoryRequest;
import com.shanti.store.marketplace.request.UpdateShipmentStatusRequest;
import com.shanti.store.marketplace.response.OrderItemResponse;
import com.shanti.store.marketplace.response.ShipmentResponse;
import com.shanti.store.marketplace.service.InventoryService;
import com.shanti.store.marketplace.service.NotificationService;
import com.shanti.store.marketplace.service.OrderStatusHistoryService;
import com.shanti.store.marketplace.service.OrderStatusService;
import com.shanti.store.marketplace.service.PaymentService;
import com.shanti.store.marketplace.service.ShipmentService;
import com.shanti.store.marketplace.service.ShipmentStatusHistoryService;
import com.shanti.store.marketplace.service.ShippingService;
import com.shanti.store.marketplace.service.TransactionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final OrderRepository orderRepository;
    private final ShippingService shippingService;
    private final ShipmentStatusHistoryService shipmentStatusHistoryService;
    private final OrderStatusHistoryService orderStatusHistoryService; 
    private final NotificationService notificationService;
    private final OrderStatusService orderStatusService;
    private final TransactionService transactionService;
    private final InventoryService inventoryService;
    private final PaymentService paymentService;
    
    @Override
    @Transactional(propagation = Propagation.MANDATORY)
    public ShipmentResponse updateShipmentStatus(Long shipmentId, String status) {

        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new EntityNotFoundException("Shipment not found"));

        ShipmentStatus shipmentStatus = ShipmentStatus.valueOf(status);

        shipment.setStatus(shipmentStatus);

        if (shipmentStatus == ShipmentStatus.SHIPPED) {
            shipment.setShippedAt(LocalDateTime.now());
        }

        if (shipmentStatus == ShipmentStatus.DELIVERED) {
            shipment.setDeliveredAt(LocalDateTime.now());
        }

        shipmentRepository.save(shipment);

        // 🔥 Update Order Status (IMPORTANT)
        updateOrderStatusBasedOnShipments(shipment.getOrder());

        return mapToResponse(shipment);
    }

    // 🔥 CORE LOGIC
    private void updateOrderStatusBasedOnShipments(Order order) {

        List<Shipment> shipments = order.getShipments();

        boolean allDelivered = shipments.stream()
                .allMatch(s -> s.getStatus() == ShipmentStatus.DELIVERED);

        boolean anyShipped = shipments.stream()
                .anyMatch(s -> s.getStatus() == ShipmentStatus.SHIPPED);

        if (allDelivered) {
            order.setStatus(OrderStatus.DELIVERED);
            order.setDeliveryDate(LocalDateTime.now());
        } else if (anyShipped) {
            order.setStatus(OrderStatus.SHIPPED);
        } else {
            order.setStatus(OrderStatus.CREATED);
        }

        orderRepository.save(order);
    }

    // 🔁 MAPPER
    private ShipmentResponse mapToResponse(Shipment shipment) {

        List<OrderItemResponse> items = shipment.getItems().stream()
                .map(this::mapItem)
                .toList();

        return ShipmentResponse.builder()
                .id(shipment.getId())
                .sellerId(shipment.getSellerAccount() != null ? shipment.getSellerAccount().getId() : null)
                .sellerName(shipment.getSellerName())
                .status(shipment.getStatus() != null ? shipment.getStatus().toString() : null)
                .courierPartner(shipment.getCourierPartner())
                .trackingId(shipment.getTrackingId())
                .shippedAt(shipment.getShippedAt())
                .deliveredAt(shipment.getDeliveredAt())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .itemsTotal(shipment.getItemsTotal())
                .shippingCharge(shipment.getShippingCharge())
                .discount(shipment.getDiscount())
                .finalAmount(shipment.getFinalAmount())
                .items(items)
                .build();
    }

    private OrderItemResponse mapItem(OrderItem item) {
        return OrderItemResponse.builder()
                .productId(item.getProduct().getId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }

	@Override
	public Shipment createShipment(Order order, SellerAccount seller, List<OrderItem> items, Address addressEntity) {

        BigDecimal itemsTotal = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = shippingService.calculateShipping(items, addressEntity, seller);
        BigDecimal discount = BigDecimal.ZERO;

        Shipment shipment = new Shipment();
        shipment.setOrder(order);
        shipment.setSellerAccount(seller);
        shipment.setSellerName(seller.getName());
        shipment.setItems(items);

        for (OrderItem item : items) {
            item.setShipment(shipment);
        }

        shipment.setItemsTotal(itemsTotal);
        shipment.setShippingCharge(shipping);
        shipment.setDiscount(discount);
        shipment.setFinalAmount(itemsTotal.add(shipping).subtract(discount));
        shipment.setStatus(ShipmentStatus.CREATED);
        if (!order.getShipments().contains(shipment)) {
            order.getShipments().add(shipment);
        }

        return shipment;
    }

	private void recalculateOrderTotals(Order order) {

	    BigDecimal subtotal = order.getShipments().stream()
	            .map(s -> s.getItemsTotal() != null ? s.getItemsTotal() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    BigDecimal shipping = order.getShipments().stream()
	            .map(s -> s.getShippingCharge() != null ? s.getShippingCharge() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    BigDecimal discount = order.getShipments().stream()
	            .map(s -> s.getDiscount() != null ? s.getDiscount() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    BigDecimal total = order.getShipments().stream()
	            .map(s -> s.getFinalAmount() != null ? s.getFinalAmount() : BigDecimal.ZERO)
	            .reduce(BigDecimal.ZERO, BigDecimal::add);

	    order.setSubtotal(subtotal);
	    order.setTotalShipping(shipping);
	    order.setTotalDiscount(discount);
	    order.setTotalPrice(total);
	}
	
	@Override
	@Transactional(propagation = Propagation.MANDATORY)
	public ShipmentResponse handleSellerAction(Long shipmentId, SellerActionRequest request) {

	    Shipment shipment = shippingService.findById(shipmentId)
	            .orElseThrow(() -> new RuntimeException("Shipment not found"));

	    if (!shipment.getSellerAccount().getId().equals(request.getSellerId())) {
	        throw new RuntimeException("Unauthorized seller");
	    }
	    
	    String action = request.getAction() != null
	            ? request.getAction().toUpperCase()
	            : "";

	    ShipmentStatus currentStatus = shipment.getStatus();

	    // ✅ IDEMPOTENCY (action → status mapping)
	    switch (action) {
	        case "ACCEPT":
	            if (currentStatus == ShipmentStatus.ACCEPTED) {
	                return ShipmentMapper.toResponse(shipment);
	            }
	            break;

	        case "REJECT":
	            if (currentStatus == ShipmentStatus.REJECTED) {
	                return ShipmentMapper.toResponse(shipment);
	            }
	            break;

	        case "READY_TO_SHIP":
	            if (currentStatus == ShipmentStatus.READY_TO_SHIP) {
	                return ShipmentMapper.toResponse(shipment);
	            }
	            break;

	        case "SHIPPED":
	            if (currentStatus == ShipmentStatus.SHIPPED) {
	                return ShipmentMapper.toResponse(shipment);
	            }
	            break;

	        case "DELIVERED":
	            if (currentStatus == ShipmentStatus.DELIVERED) {
	                return ShipmentMapper.toResponse(shipment);
	            }
	            break;

	        default:
	            throw new RuntimeException("Invalid action");
	    }

//	    String action = request.getAction().toUpperCase();
	    NotificationType notificationType;
	    String actionText;
	    ShipmentStatus oldShipmentStatus = shipment.getStatus();
	    Order order = shipment.getOrder();
	    OrderStatus oldOrderStatus = order.getStatus();
	    
	    Payment payment = getLatestPayment(shipment.getOrder());
	    switch (action) {
	        case "ACCEPT":
	            shipment.setStatus(ShipmentStatus.ACCEPTED);
	            shipmentStatusHistoryService.record(
	                    ShipmentStatusHistoryRequest.builder()
	                            .shipmentId(shipment.getId())
	                            .userId(order.getUser().getId())
	                            .oldStatus(oldShipmentStatus)
	                            .newStatus(shipment.getStatus())
	                            .changedBy("SELLER_" + request.getSellerId())
	                            .build()
	            );
	            notificationType = NotificationType.ORDER_CONFIRMED;
	            actionText = "ACCEPTED";
	            break;

	        case "REJECT":	         
	            processShipmentRejection(shipment, payment);
	            paymentService.handlePostShipmentRejection(order, payment);
	            notificationType = NotificationType.ORDER_CANCELLED;
	            shipmentStatusHistoryService.record(
	            	    ShipmentStatusHistoryRequest.builder()
	            	        .shipmentId(shipment.getId())
	            	        .userId(order.getUser().getId())
	            	        .oldStatus(oldShipmentStatus)
	            	        .newStatus(ShipmentStatus.REJECTED)
	            	        .changedBy("SELLER_" + request.getSellerId())
	            	        .build()
	            	);
	            actionText = "REJECTED";
	            break;
	          
	        case "READY_TO_SHIP":
	            if (shipment.getStatus() != ShipmentStatus.ACCEPTED) {
	                throw new RuntimeException("Invalid transition");
	            }
	            shipment.setStatus(ShipmentStatus.READY_TO_SHIP);

	            notificationType = NotificationType.ORDER_SHIPPED;
	            actionText = "READY_TO_SHIP";
	            break;

	        case "SHIPPED":
	            if (shipment.getStatus() != ShipmentStatus.READY_TO_SHIP) {
	                throw new RuntimeException("Invalid transition");
	            }
	            shipment.setStatus(ShipmentStatus.SHIPPED);

	            notificationType = NotificationType.ORDER_SHIPPED;
	            actionText = "SHIPPED";
	            break;

	        case "DELIVERED":
	            if (shipment.getStatus() != ShipmentStatus.SHIPPED) {
	                throw new RuntimeException("Invalid transition");
	            }

	            shipment.setStatus(ShipmentStatus.DELIVERED);
	            
	            paymentService.handleShipmentDelivered(order, shipment);
	            
//	            if (payment != null &&
//	            	    payment.getPaymentMethod() == PaymentMode.CASH_ON_DELIVERY &&
//	            	    payment.getStatus() != PaymentStatus.SUCCESS) {
//
//	            	    BigDecimal shipmentAmount = shipment.getFinalAmount() != null
//	            	            ? shipment.getFinalAmount()
//	            	            : BigDecimal.ZERO;
//
//	            	    BigDecimal alreadyPaid = payment.getPaidAmount() != null
//	            	            ? payment.getPaidAmount()
//	            	            : BigDecimal.ZERO;
//
//	            	    BigDecimal newPaidAmount = alreadyPaid.add(shipmentAmount);
//
//	            	    paymentService.markCODCollected(payment, newPaidAmount);
//
//	            	    transactionService.createTransactions(order, payment);
//	            	    
//	            	    transactionService.completeTransactionsIfPaymentDone(order, payment);
//	            }
	            notificationType = NotificationType.ORDER_DELIVERED;
	            actionText = "DELIVERED";
	            break;

	        default:
	            throw new RuntimeException("Invalid action");
	    }

	    shipment = shippingService.save(shipment);
	    recalculateOrderTotals(order);
	    
	    orderStatusService.updateOrderStatus(order);
	    
	    orderRepository.save(order);
	    
	    orderStatusHistoryService.record(
	            OrderStatusHistoryRequest.builder()
	                    .orderId(order.getId())
	                    .userId(order.getUser().getId())
	                    .oldStatus(oldOrderStatus)
	                    .newStatus(order.getStatus())
	                    .changedBy("SELLER_" + request.getSellerId())
	                    .build()
	    );

	    notificationService.createNotification(
	            NotificationRequest.builder()
	                    .userId(order.getUser().getId())
	                    .title("Order Update")
	                    .message("Seller has " + actionText.toLowerCase() + " an item in your order")
	                    .type(notificationType)
	                    .referenceType(ReferenceType.ORDER)
	                    .referenceId(order.getId())
	                    .redirectUrl("/orders/" + order.getId())
	                    .build()
	    );

	    return ShipmentMapper.toResponse(shipment);
	}
	
	@Override
	@Transactional(propagation = Propagation.MANDATORY)
	public void processShipmentRejection(Shipment shipment, Payment payment) {

		transactionService.handleShipmentRejection(shipment, payment);

		inventoryService.restoreStockForShipment(shipment);
	}
	
	@Override
	@Transactional(propagation = Propagation.MANDATORY)
	public void validateShipmentTransition(ShipmentStatus current, ShipmentStatus next) {
		// Allow rejection anytime before shipping
		if (next == ShipmentStatus.REJECTED &&
			    (current == ShipmentStatus.CREATED ||
			     current == ShipmentStatus.ACCEPTED ||
			     current == ShipmentStatus.READY_TO_SHIP)) {
			    return;
			}

	    if (current == ShipmentStatus.ACCEPTED && next == ShipmentStatus.READY_TO_SHIP) return;

	    if (current == ShipmentStatus.READY_TO_SHIP && next == ShipmentStatus.SHIPPED) return;

	    if (current == ShipmentStatus.SHIPPED && next == ShipmentStatus.IN_TRANSIT) return;

	    if (current == ShipmentStatus.IN_TRANSIT && next == ShipmentStatus.OUT_FOR_DELIVERY) return;

	    if (current == ShipmentStatus.OUT_FOR_DELIVERY && next == ShipmentStatus.DELIVERED) return;

	    throw new RuntimeException("Invalid status transition");
	}
	
	@Override
	@Transactional
	public ShipmentResponse updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request) {

	    Shipment shipment = shippingService.findById(shipmentId)
	            .orElseThrow(() -> new RuntimeException("Shipment not found"));

	    if (!shipment.getSellerAccount().getId().equals(request.getSellerId())) {
	        throw new RuntimeException("Unauthorized seller");
	    }

	    ShipmentStatus current = shipment.getStatus();
	    ShipmentStatus next;

	    try {
	        next = ShipmentStatus.valueOf(request.getStatus().toUpperCase());
	    } catch (Exception e) {
	        throw new RuntimeException("Invalid shipment status");
	    }

	    // ✅ IDEMPOTENCY
	    if (current == next) {
	        return ShipmentMapper.toResponse(shipment);
	    }

	    // ✅ STRICT FLOW VALIDATION
	    validateShipmentTransition(current, next);

	    ShipmentStatus oldShipmentStatus = shipment.getStatus();
	    Order order = shipment.getOrder();
	    OrderStatus oldOrderStatus = order.getStatus();
	    
	    if (next == ShipmentStatus.REJECTED) {
	        Payment payment = getLatestPayment(order);

	        processShipmentRejection(shipment, payment);
	        paymentService.handlePostShipmentRejection(order, payment); 
	    } else {
	        shipment.setStatus(next);
	    }
	    
	    shipmentStatusHistoryService.record(
	            ShipmentStatusHistoryRequest.builder()
	                    .shipmentId(shipment.getId())
	                    .userId(order.getUser().getId())
	                    .oldStatus(oldShipmentStatus)
	                    .newStatus(next)
	                    .changedBy("SELLER_" + request.getSellerId())
	                    .build()
	    );
	    
	    if (next == ShipmentStatus.SHIPPED) {
	        shipment.setShippedAt(LocalDateTime.now());
	    }
	    
	    if (next == ShipmentStatus.DELIVERED) {
	        shipment.setDeliveredAt(LocalDateTime.now());

	        paymentService.handleShipmentDelivered(order, shipment);
	    }
	    
	    shipment = shippingService.save(shipment);
	    
	    orderStatusService.updateOrderStatus(order);

	    orderRepository.save(order);

	    orderStatusHistoryService.record(
	            OrderStatusHistoryRequest.builder()
	                    .orderId(order.getId())
	                    .userId(order.getUser().getId())
	                    .oldStatus(oldOrderStatus)
	                    .newStatus(order.getStatus())
	                    .changedBy("SELLER_" + request.getSellerId())
	                    .build()
	    );
	    
	    notificationService.createNotification(
	            NotificationRequest.builder()
	                    .userId(order.getUser().getId())
	                    .title("Order Update")
	                    .message("Your order is now " + next.name().replace("_", " "))
	                    .type(mapShipmentStatusToNotification(next))
	                    .referenceType(ReferenceType.ORDER)
	                    .referenceId(order.getId())
	                    .redirectUrl("/orders/" + order.getId())
	                    .build()
	    );

	    return ShipmentMapper.toResponse(shipment);
	}
	
	private Payment getLatestPayment(Order order) {
	    return order.getPayments().stream()
	            .filter(p -> p.getCreatedAt() != null)
	            .max(Comparator.comparing(Payment::getCreatedAt))
	            .orElseThrow(() -> new RuntimeException("Payment not found"));
	}
	
	private NotificationType mapShipmentStatusToNotification(ShipmentStatus status) {
	    switch (status) {
	        case READY_TO_SHIP:
	            return NotificationType.ORDER_CONFIRMED;
	        case SHIPPED:
	        case IN_TRANSIT:
	        case OUT_FOR_DELIVERY:
	            return NotificationType.ORDER_SHIPPED;
	        case DELIVERED:
	            return NotificationType.ORDER_DELIVERED;
	        default:
	            return NotificationType.SYSTEM;
	    }
	}
	
}