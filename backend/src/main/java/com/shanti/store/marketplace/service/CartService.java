package com.shanti.store.marketplace.service;

import com.shanti.store.marketplace.entity.User;
import com.shanti.store.marketplace.request.AddToCartRequest;
import com.shanti.store.marketplace.request.RemoveFromCartRequest;
import com.shanti.store.marketplace.response.CartResponse;

public interface CartService {
    CartResponse addToCart(AddToCartRequest request);
    CartResponse getCart(Long userId);
    CartResponse updateQuantity(AddToCartRequest request);
    CartResponse removeFromCart(RemoveFromCartRequest request);
    void clearCart(User user);
}
