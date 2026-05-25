package com.shanti.store.marketplace.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.shanti.store.marketplace.request.BuyNowRequest;
import com.shanti.store.marketplace.request.CheckoutRequest;
import com.shanti.store.marketplace.request.SellerActionRequest;
import com.shanti.store.marketplace.request.UpdateShipmentStatusRequest;
import com.shanti.store.marketplace.response.OrderResponse;
import com.shanti.store.marketplace.response.OrderSummaryResponse;
import com.shanti.store.marketplace.response.ShipmentResponse;

public interface OrderService {

    List<OrderResponse> getOrdersByUser(Long userId);

    Page<OrderResponse> getOrdersByUser(Long userId, int page, int size);

    OrderResponse getOrderById(Long orderId);
    
    OrderResponse checkout(CheckoutRequest request);

    OrderResponse buyNow(BuyNowRequest request);
    
    List<OrderResponse> getOrdersBySeller(Long sellerId);
    
    OrderResponse previewCheckout(CheckoutRequest request);
    
    OrderResponse previewBuyNow(BuyNowRequest request);

    ShipmentResponse handleSellerAction(Long shipmentId, SellerActionRequest request);

    ShipmentResponse updateShipmentStatus(Long shipmentId, UpdateShipmentStatusRequest request);

    List<ShipmentResponse> getShipmentsBySeller(Long sellerId);
    
    OrderResponse cancelOrder(Long orderId, Long userId);

	OrderSummaryResponse getOrderSummary(Long orderId);
	
	OrderResponse getOrderForSeller(Long orderId, Long sellerId);

}

