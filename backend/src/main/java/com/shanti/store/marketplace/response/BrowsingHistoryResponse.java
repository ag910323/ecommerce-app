package com.shanti.store.marketplace.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrowsingHistoryResponse {

	private Long id;
	private ProductResponse productResponse;

    private Integer viewCount;
    private Integer clickCount;

    private LocalDateTime lastViewedAt;
}