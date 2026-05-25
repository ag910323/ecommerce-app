package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.Cart;
import com.shanti.store.marketplace.entity.CartItem;
import com.shanti.store.marketplace.response.CartItemResponse;
import com.shanti.store.marketplace.response.CartResponse;

import java.util.List;
import java.util.stream.Collectors;

public class CartMapper {

    private CartMapper() {}

    public static CartItemResponse toItemResponse(CartItem item) {
        if (item == null) {
            return null;
        }

        return CartItemResponse.builder()
                .id(item.getId())

                // ✅ FROM VARIANT
                .productId(item.getVariant().getProduct().getId())
                .variantId(item.getVariant().getId())
                .productName(item.getVariant().getProduct().getName())
                .variantName(item.getVariant().getVariantName())
                .attributes(item.getVariant().getAttributes())

                .quantity(item.getQuantity())
                .price(item.getPrice())

                // ✅ Optional but recommended (for UI)
                .images(item.getVariant().getImages())

                .build();
    }

    public static CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getCartItems() == null
                ? List.of()
                : cart.getCartItems()
                    .stream()
                    .map(CartMapper::toItemResponse)
                    .collect(Collectors.toList());

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalItems(cart.getTotalItems())
                .totalSellingPrice(cart.getTotalSellingPrice())
                .totalMRP(cart.getTotalMRP())
                .totalDiscount(cart.getTotalDiscount())
                .build();
    }
}