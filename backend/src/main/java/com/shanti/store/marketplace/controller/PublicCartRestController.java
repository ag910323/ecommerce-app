package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.AddToCartRequest;
import com.shanti.store.marketplace.request.RemoveFromCartRequest;
import com.shanti.store.marketplace.service.CartService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/cart")
@RequiredArgsConstructor
public class PublicCartRestController {

    private final CartService cartService;

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ApiResponseBuilder.success(cartService.addToCart(request), "Product added to cart successfully");
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getCart(@PathVariable Long userId) {
        return ApiResponseBuilder.success(cartService.getCart(userId), "Cart fetched successfully");
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateQuantity(@Valid @RequestBody AddToCartRequest request) {
        return ApiResponseBuilder.success(cartService.updateQuantity(request), "Quantity updated successfully");
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFromCart(@Valid @RequestBody RemoveFromCartRequest request) {
        return ApiResponseBuilder.success(cartService.removeFromCart(request), "Item removed from cart successfully");
    }
}