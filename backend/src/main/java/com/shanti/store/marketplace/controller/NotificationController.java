package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.PaginationRequest;
import com.shanti.store.marketplace.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

	private final NotificationService notificationService;

	@GetMapping("/{userId}")
	public ResponseEntity<?> getNotifications(@PathVariable Long userId, PaginationRequest request) {
		return ApiResponseBuilder.success(notificationService.getUserNotifications(userId, request),
				"Notifications fetched successfully");
	}

	@PutMapping("/{id}/read")
	public ResponseEntity<?> markAsRead(@PathVariable Long id) {
		notificationService.markAsRead(id);
		return ApiResponseBuilder.success(null, "Notification marked as read");
	}

	@GetMapping("/{userId}/unread-count")
	public ResponseEntity<?> getUnreadCount(@PathVariable Long userId) {
		return ApiResponseBuilder.success(notificationService.getUnreadCount(userId), "Unread count fetched");
	}
}