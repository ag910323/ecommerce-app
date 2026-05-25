package com.shanti.store.marketplace.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewResponse {
    private Long id;
    private Double rating;
    private String comment;
    private String userName;
}
