package com.shanti.store.marketplace.mapper;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.shanti.store.marketplace.entity.Wishlist;
import com.shanti.store.marketplace.entity.WishlistItem;
import com.shanti.store.marketplace.response.WishlistItemResponse;
import com.shanti.store.marketplace.response.WishlistResponse;

public class WishlistMapper {

    private WishlistMapper() {
        // Prevent instantiation
    }

    public static WishlistResponse toResponse(Wishlist wishlist) {
        if (wishlist == null) {
            return null;
        }

        return WishlistResponse.builder()
                .wishlistId(wishlist.getId())
                .name(wishlist.getName())
                .description(wishlist.getDescription())
                .items(toItemResponseList(wishlist.getItems()))
                .build();
    }

    public static List<WishlistItemResponse> toItemResponseList(List<WishlistItem> items) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        return items.stream()
                .map(WishlistMapper::toItemResponse)
                .collect(Collectors.toList());
    }

    public static WishlistItemResponse toItemResponse(WishlistItem item) {
        if (item == null || item.getProduct() == null) {
            return null;
        }

        var p = item.getProduct();

        return WishlistItemResponse.builder()
                .productId(p.getId())
                .name(p.getName())
                .brandName(p.getBrand() != null ? p.getBrand().getName() : null)
                .price(p.getPrice() != null ? p.getPrice().doubleValue() : null)
                .addedDate(item.getAddedDate())
                .build();
    }
}
