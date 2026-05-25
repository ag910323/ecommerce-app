package com.shanti.store.marketplace.response;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class WishlistResponse {

    private Long wishlistId;
    private String name;
    private String description;
    private List<WishlistItemResponse> items;

}
