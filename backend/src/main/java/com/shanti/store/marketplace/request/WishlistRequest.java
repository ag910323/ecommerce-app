package com.shanti.store.marketplace.request;

import lombok.Data;

@Data
public class WishlistRequest {
    private Long userId;
    private Long wishlistId;
    private Long productId;
}
