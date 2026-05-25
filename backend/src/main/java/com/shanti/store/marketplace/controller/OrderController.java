package com.shanti.store.marketplace.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.BuyNowRequest;
import com.shanti.store.marketplace.request.CheckoutRequest;
import com.shanti.store.marketplace.request.OrderPageRequest;
import com.shanti.store.marketplace.request.SellerActionRequest;
import com.shanti.store.marketplace.request.UpdateShipmentStatusRequest;
import com.shanti.store.marketplace.response.ApiResponse;
import com.shanti.store.marketplace.response.OrderResponse;
import com.shanti.store.marketplace.response.OrderSummaryResponse;
import com.shanti.store.marketplace.service.OrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @Deprecated
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByUser(@PathVariable Long userId) {
        List<OrderResponse> orders = orderService.getOrdersByUser(userId);
        return ApiResponseBuilder.success(orders, "Orders fetched successfully");
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersBySeller(@PathVariable Long sellerId) {
        List<OrderResponse> orders = orderService.getOrdersBySeller(sellerId);
        return ApiResponseBuilder.success(orders, "Seller orders fetched successfully");
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long orderId) {
        OrderResponse order = orderService.getOrderById(orderId);
        return ApiResponseBuilder.success(order, "Order fetched successfully");
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(@Valid @RequestBody CheckoutRequest request) {
        OrderResponse order = orderService.checkout(request);
        return ApiResponseBuilder.success(order, "Checkout completed successfully");
    }

    @PostMapping("/buy-now")
    public ResponseEntity<ApiResponse<OrderResponse>> buyNow(@Valid @RequestBody BuyNowRequest request) {
        OrderResponse order = orderService.buyNow(request);
        return ApiResponseBuilder.success(order, "Order placed successfully via Buy Now");
    }

    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<OrderResponse>> preview(@Valid @RequestBody CheckoutRequest request) {
        OrderResponse order = orderService.previewCheckout(request);
        return ApiResponseBuilder.success(order, "Order preview calculated");
    }

    @PostMapping("/buy-now/preview")
    public ResponseEntity<ApiResponse<OrderResponse>> previewBuyNow(@Valid @RequestBody BuyNowRequest request) {
        OrderResponse order = orderService.previewBuyNow(request);
        return ApiResponseBuilder.success(order, "Buy Now preview calculated");
    }

    @PutMapping("/shipments/{shipmentId}/action")
    public ResponseEntity<?> sellerAction(
            @PathVariable Long shipmentId,
            @Valid @RequestBody SellerActionRequest request) {

        return ApiResponseBuilder.success(
                orderService.handleSellerAction(shipmentId, request),
                "Seller action processed"
        );
    }

    @PutMapping("/shipments/{shipmentId}/status")
    public ResponseEntity<?> updateShipmentStatus(
            @PathVariable Long shipmentId,
            @Valid @RequestBody UpdateShipmentStatusRequest request) {

        return ApiResponseBuilder.success(
                orderService.updateShipmentStatus(shipmentId, request),
                "Shipment status updated"
        );
    }

    @GetMapping("/seller/{sellerId}/shipments")
    public ResponseEntity<?> getSellerShipments(@PathVariable Long sellerId) {
        return ApiResponseBuilder.success(
                orderService.getShipmentsBySeller(sellerId),
                "Seller shipments fetched"
        );
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam Long userId
    ) {
        return ApiResponseBuilder.success(
                orderService.cancelOrder(orderId, userId),
                "Order cancelled"
        );
    }

    @GetMapping("/{orderId}/summary")
    public ResponseEntity<ApiResponse<OrderSummaryResponse>> getOrderSummary(
            @PathVariable Long orderId) {

        return ApiResponseBuilder.success(
                orderService.getOrderSummary(orderId),
                "Order summary fetched"
        );
    }

    @PostMapping("/validate-checkout")
    public ResponseEntity<?> validateCheckout(@Valid @RequestBody CheckoutRequest request) {
        orderService.previewCheckout(request);
        return ApiResponseBuilder.success(null, "Checkout valid");
    }

    @PostMapping("/user/{userId}/paged")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getOrdersByUserPaged(
            @PathVariable Long userId,
            @RequestBody OrderPageRequest request) {

        return ApiResponseBuilder.success(
                orderService.getOrdersByUser(userId, request.getPage(), request.getSize()),
                "Orders fetched (paged)"
        );
    }

    @GetMapping("/{orderId}/seller/{sellerId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderForSeller(
            @PathVariable Long orderId,
            @PathVariable Long sellerId) {

        return ApiResponseBuilder.success(
                orderService.getOrderForSeller(orderId, sellerId),
                "Seller order fetched"
        );
    }
}