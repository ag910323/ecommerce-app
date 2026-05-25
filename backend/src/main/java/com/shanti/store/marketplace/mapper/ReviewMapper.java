package com.shanti.store.marketplace.mapper;

import com.shanti.store.marketplace.entity.Review;
import com.shanti.store.marketplace.response.ReviewResponse;

public class ReviewMapper {
	
	private ReviewMapper() {
		
	}

    public static ReviewResponse toResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userName(
                    review.getUser() != null ? review.getUser().getFirstName() : null
                )
                .build();
    }
}
