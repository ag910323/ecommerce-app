package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {

    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private BigDecimal discount;
    private BigDecimal productPriceSnapshot;
    private Long variantId;
    private String variantName;
    private Map<String, String> attributes;
    private List<String> images;
}