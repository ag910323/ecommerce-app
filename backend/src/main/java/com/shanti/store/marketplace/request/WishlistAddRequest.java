package com.shanti.store.marketplace.request;

import lombok.Data;

@Data
public class WishlistAddRequest {
    private Long userId;      // or get from @AuthenticationPrincipal
    private Long wishlistId;  // optional, null if using default
    private Long productId;
}

