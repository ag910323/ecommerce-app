package com.shanti.store.marketplace.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.shanti.store.marketplace.entity.WishlistItem;
import com.shanti.store.marketplace.entity.Wishlist;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long>,
        JpaSpecificationExecutor<WishlistItem> {

    // ✅ Check if a product already exists in a given wishlist
    boolean existsByWishlistIdAndProductId(Long wishlistId, Long productId);

    // ✅ Get all items by wishlist
    List<WishlistItem> findByWishlist(Wishlist wishlist);

    // ✅ Optional: remove all items in a wishlist (useful for cleanup)
    void deleteByWishlist(Wishlist wishlist);
}
