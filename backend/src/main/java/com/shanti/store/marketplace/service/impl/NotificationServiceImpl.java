package com.shanti.store.marketplace.service.impl;

import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.shanti.store.marketplace.entity.Notification;
import com.shanti.store.marketplace.entity.Order;
import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.enums.NotificationType;
import com.shanti.store.marketplace.enums.ReferenceType;
import com.shanti.store.marketplace.enums.ShipmentStatus;
import com.shanti.store.marketplace.repository.NotificationRepository;
import com.shanti.store.marketplace.repository.UserRepository;
import com.shanti.store.marketplace.request.NotificationRequest;
import com.shanti.store.marketplace.request.PaginationRequest;
import com.shanti.store.marketplace.response.NotificationResponse;
import com.shanti.store.marketplace.service.NotificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    public void createNotification(NotificationRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .referenceType(request.getReferenceType())
                .referenceId(request.getReferenceId())
                .redirectUrl(request.getRedirectUrl())
                .build();

        notificationRepository.save(notification);
    }

    @Override
    public Page<NotificationResponse> getUserNotifications(Long userId, PaginationRequest request) {

        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(request.getDirection());
        } catch (Exception e) {
            direction = Sort.Direction.DESC;
        }

        int size = Math.min(request.getSize(), 50);

        Pageable pageable = PageRequest.of(
                request.getPage(),
                size,
                Sort.by(direction, request.getSortBy())
        );

        Page<Notification> page = notificationRepository.findByUserId(userId, pageable);

        // 🔥 Mapping Entity → DTO
        return page.map(this::mapToResponse);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.isRead())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .createdAt(notification.getCreatedAt())
                .redirectUrl(notification.getRedirectUrl())
                .build();
    }

    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    @Override
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

	@Override
	public void sendOrderNotification(Order order) {
        createNotification(
                NotificationRequest.builder()
                        .userId(order.getUser().getId())
                        .title("Order Placed")
                        .message("Your order #" + order.getId() + " has been placed successfully")
                        .type(NotificationType.ORDER_PLACED)
                        .referenceType(ReferenceType.ORDER)
                        .referenceId(order.getId())
                        .redirectUrl("/orders/" + order.getId())
                        .build()
        );
    }

	@Override
	public void sendCancelNotification(Order order) {
		String message;

		boolean allRejected = order.getShipments().stream()
		        .allMatch(s -> s.getStatus() == ShipmentStatus.REJECTED);

		if (allRejected) {
		    message = "Your order #" + order.getId() + " has been cancelled";
		} else {
		    message = "Some items in your order #" + order.getId() + " were rejected";
		}

	    createNotification(
	            NotificationRequest.builder()
	                    .userId(order.getUser().getId())
	                    .title("Order Update")
	                    .message(message)
	                    .type(NotificationType.ORDER_CANCELLED)
	                    .referenceType(ReferenceType.ORDER)
	                    .referenceId(order.getId())
	                    .redirectUrl("/orders/" + order.getId())
	                    .build()
	    );
	}
}