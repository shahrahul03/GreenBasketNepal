package com.greenbasket.nepal.domain.review.service;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.review.dto.ReviewRequest;
import com.greenbasket.nepal.domain.review.dto.ReviewResponse;
import com.greenbasket.nepal.domain.review.dto.ReviewStatsResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse createReview(Long userId, ReviewRequest request);

    List<ReviewResponse> getProductReviewsPublic(Long productId);

    PagedResponse<ReviewResponse> getProductReviews(Long productId, int page, int size, boolean includeHidden);

    PagedResponse<ReviewResponse> getMyReviews(Long userId, int page, int size);

    PagedResponse<ReviewResponse> getReviewsForMyProducts(Long sellerId, int page, int size);

    void deleteReview(Long reviewId, Long userId);

    void hideReview(Long reviewId);

    void showReview(Long reviewId);

    ReviewStatsResponse getReviewStats(Long productId);

    boolean hasUserReviewedProduct(Long userId, Long productId);
}
