package com.shanti.store.marketplace.request;

import java.util.List;

import lombok.Data;

@Data
public class WishlistFilterRequest {
    private Long userId;
    private Long wishlistId;
    private String search;
    private Double minPrice;
    private Double maxPrice;
    private List<Long> categoryIds;
    private List<Long> brandIds;
    private PaginationModel pagination = new PaginationModel();
}
