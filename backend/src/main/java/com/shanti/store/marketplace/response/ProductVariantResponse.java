package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductVariantResponse {

    private Long id;
    private String variantName;
    private Map<String, String> attributes;
    private BigDecimal price;
    private Integer stockQuantity;
    private String sku;
    private List<String> images;
}