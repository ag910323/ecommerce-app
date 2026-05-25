package com.shanti.store.marketplace.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WishlistItemResponse {
    private Long productId;
    private String name;
    private String brandName;
    private Double price;
    private LocalDateTime addedDate;

}
