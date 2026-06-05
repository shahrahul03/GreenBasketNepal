package com.greenbasket.nepal.domain.review.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.review.dto.ReviewRequest;
import com.greenbasket.nepal.domain.review.dto.ReviewResponse;
import com.greenbasket.nepal.domain.review.dto.ReviewStatsResponse;
import com.greenbasket.nepal.domain.review.service.ReviewService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ──────────────────────────────────────────────
    //  Public endpoints — anyone can view product reviews & stats
    // ──────────────────────────────────────────────

    @GetMapping("/api/v1/reviews/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getProductReviews(
            @PathVariable Long productId) {
        List<ReviewResponse> reviews = reviewService.getProductReviewsPublic(productId);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/api/v1/reviews/product/{productId}/stats")
    public ResponseEntity<ApiResponse<ReviewStatsResponse>> getReviewStats(
            @PathVariable Long productId) {
        ReviewStatsResponse stats = reviewService.getReviewStats(productId);
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // ──────────────────────────────────────────────
    //  Authenticated endpoints — customer actions
    // ──────────────────────────────────────────────

    @PostMapping("/api/v1/reviews")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @Valid @RequestBody ReviewRequest request,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        ReviewResponse review = reviewService.createReview(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review submitted successfully", review));
    }

    @GetMapping("/api/v1/reviews/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        PagedResponse<ReviewResponse> reviews = reviewService.getMyReviews(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @DeleteMapping("/api/v1/reviews/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        reviewService.deleteReview(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }

    // ──────────────────────────────────────────────
    //  Farmer endpoints — view reviews for own products
    // ──────────────────────────────────────────────

    @GetMapping("/api/v1/farmer/reviews")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getFarmerProductReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        PagedResponse<ReviewResponse> reviews =
                reviewService.getReviewsForMyProducts(currentUser.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    // ──────────────────────────────────────────────
    //  Admin endpoints — moderation
    // ──────────────────────────────────────────────

    @GetMapping("/api/v1/admin/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getAllReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<ReviewResponse> reviews = reviewService.getProductReviews(null, page, size, true);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @GetMapping("/api/v1/admin/reviews/product/{productId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<ReviewResponse>>> getProductReviewsAdmin(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PagedResponse<ReviewResponse> reviews = reviewService.getProductReviews(productId, page, size, true);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }

    @PutMapping("/api/v1/admin/reviews/{id}/hide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hideReview(@PathVariable Long id) {
        reviewService.hideReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review hidden successfully", null));
    }

    @PutMapping("/api/v1/admin/reviews/{id}/show")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> showReview(@PathVariable Long id) {
        reviewService.showReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review shown successfully", null));
    }
}
