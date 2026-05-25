package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.ProductVariant;
import com.shanti.store.marketplace.response.ProductVariantResponse;

public class ProductVariantMapper {
	
	private ProductVariantMapper() {
		
	}

    public static ProductVariantResponse toResponse(ProductVariant variant) {
        return ProductVariantResponse.builder()
                .id(variant.getId())
                .variantName(variant.getVariantName())
                .attributes(variant.getAttributes())
                .price(variant.getPrice())
                .stockQuantity(variant.getStockQuantity())
                .sku(variant.getSku())
                .images(variant.getImages())
                .build();
    }
}
