package com.shanti.store.marketplace.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.shanti.store.marketplace.builder.ApiResponseBuilder;
import com.shanti.store.marketplace.request.WishlistAddRequest;
import com.shanti.store.marketplace.request.WishlistCreateRequest;
import com.shanti.store.marketplace.request.WishlistFilterRequest;
import com.shanti.store.marketplace.service.WishlistService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/wishlists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WishlistRestController {

    private final WishlistService wishlistService;

    /** ✅ Create a new wishlist */
    @PostMapping("/create")
    public ResponseEntity<?> createWishlist(@RequestBody WishlistCreateRequest request) {
        return ApiResponseBuilder.success(
            wishlistService.createWishlist(request),
            "Wishlist created successfully"
        );
    }

    /** ✅ Get all wishlists for a user */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserWishlists(@PathVariable Long userId) {
        return ApiResponseBuilder.success(
            wishlistService.getUserWishlists(userId),
            "Wishlists fetched successfully"
        );
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(@RequestBody WishlistAddRequest request) {
        return ApiResponseBuilder.success(
            wishlistService.addToWishlist(request.getUserId(), request.getWishlistId(), request.getProductId()),
            "Product added to wishlist successfully"
        );
    }
    
    /** ✅ Add product to a specific wishlist */
    @PostMapping("/{wishlistId}/add/{productId}")
    public ResponseEntity<?> addToWishlist(@PathVariable Long wishlistId,
                                           @PathVariable Long productId) {
        return ApiResponseBuilder.success(
            wishlistService.addToWishlist(wishlistId, productId),
            "Product added to wishlist successfully"
        );
    }

    /** ✅ Remove product from wishlist */
    @DeleteMapping("/{wishlistId}/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long wishlistId,
                                                @PathVariable Long productId) {
        return ApiResponseBuilder.success(
            wishlistService.removeFromWishlist(wishlistId, productId),
            "Product removed from wishlist successfully"
        );
    }

    /** ✅ Check if product is in wishlist */
    @GetMapping("/{wishlistId}/contains/{productId}")
    public ResponseEntity<?> isProductInWishlist(@PathVariable Long wishlistId,
                                                 @PathVariable Long productId) {
        return ApiResponseBuilder.success(
            wishlistService.isProductInWishlist(wishlistId, productId),
            "Wishlist status checked successfully"
        );
    }

    /** ✅ Filter & paginate wishlist items */
    @PostMapping("/filter")
    public ResponseEntity<?> filterWishlist(@RequestBody WishlistFilterRequest request) {
        return ApiResponseBuilder.success(
            wishlistService.filterWishlist(request),
            "Filtered wishlist fetched successfully"
        );
    }
}
