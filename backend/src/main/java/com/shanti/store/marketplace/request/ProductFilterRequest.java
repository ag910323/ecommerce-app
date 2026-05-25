package com.shanti.store.marketplace.request;

import java.util.List;

import lombok.Data;

@Data
public class ProductFilterRequest {
	
	private Long sellerId;
	private List<Long> categoryIds;  // Changed to support multiple categories
    private String search;
    private Double minPrice;
    private Double maxPrice;
    private List<String> brands;
    private List<Long> brandIds;// Changed to support multiple brands
    private List<String> statuses;
    private Boolean isSponsored = null;
    private Integer minDiscount;
    private Boolean isDeal;
    private Boolean isTrending;
    private PaginationModel pagination = new PaginationModel();

}
