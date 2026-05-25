package com.shanti.store.marketplace.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class CartResponse {
    private Long id;
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal totalSellingPrice;
    private BigDecimal totalMRP;
    private BigDecimal totalDiscount;
}