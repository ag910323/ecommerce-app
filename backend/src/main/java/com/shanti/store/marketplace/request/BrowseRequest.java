package com.shanti.store.marketplace.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrowseRequest {
	
	private Long userId;

    private Long productId;

    /**
     * HOME, SEARCH, CATEGORY, DETAILS
     */
    private String source;
}