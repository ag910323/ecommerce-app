package com.shanti.store.marketplace.request;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class ProductVariantRequest {

    @NotBlank(message = "Variant name is required")
    private String variantName;

    private Map<String, String> attributes;

    @PositiveOrZero(message = "Variant price must be zero or positive")
    private BigDecimal price;

    @Min(value = 0, message = "Stock quantity must be zero or greater")
    private Integer stockQuantity;

    private String sku;

    private List<String> images;
}