package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
    private Long variantId;
    private String variantName;
    private List<String> images;
    private Map<String, String> attributes;
}
