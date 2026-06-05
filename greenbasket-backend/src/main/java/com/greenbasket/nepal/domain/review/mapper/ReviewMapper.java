package com.greenbasket.nepal.domain.review.mapper;

import com.greenbasket.nepal.domain.review.dto.ReviewResponse;
import com.greenbasket.nepal.domain.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse toResponse(Review review) {
        ReviewResponse.CustomerInfo customerInfo = ReviewResponse.CustomerInfo.builder()
                .id(review.getCustomer().getId())
                .fullName(review.getCustomer().getFullName())
                .avatarUrl(review.getCustomer().getAvatarUrl())
                .build();

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .customer(customerInfo)
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName())
                .orderId(review.getOrder().getId())
                .isVisible(review.isVisible())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}
