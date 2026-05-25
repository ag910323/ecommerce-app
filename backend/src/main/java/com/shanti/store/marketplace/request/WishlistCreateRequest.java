package com.shanti.store.marketplace.request;

import lombok.Data;

@Data
public class WishlistCreateRequest {
    private Long userId;
    private String name;
    private String description;
}
