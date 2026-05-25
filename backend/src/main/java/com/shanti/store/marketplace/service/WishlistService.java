package com.shanti.store.marketplace.service;

import java.util.List;

import com.shanti.store.marketplace.request.WishlistCreateRequest;
import com.shanti.store.marketplace.request.WishlistFilterRequest;
import com.shanti.store.marketplace.response.PagedResponse;
import com.shanti.store.marketplace.response.WishlistResponse;

public interface WishlistService {

    /**
     * ✅ Create a new wishlist for a user
     */
    WishlistResponse createWishlist(WishlistCreateRequest request);

    /**
     * ✅ Get all wishlists belonging to a specific user
     */
    List<WishlistResponse> getUserWishlists(Long userId);

    /**
     * ✅ Add a product to a specific wishlist
     */
    WishlistResponse addToWishlist(Long wishlistId, Long productId);

    /**
     * ✅ Remove a product from a wishlist
     */
    WishlistResponse removeFromWishlist(Long wishlistId, Long productId);

    /**
     * ✅ Check if a product exists in a wishlist
     */
    boolean isProductInWishlist(Long wishlistId, Long productId);

    /**
     * ✅ Filter wishlist items with pagination, sorting, and optional filters
     */
    PagedResponse<?> filterWishlist(WishlistFilterRequest request);

    WishlistResponse addToWishlist(Long userId, Long wishlistId, Long productId);
}
