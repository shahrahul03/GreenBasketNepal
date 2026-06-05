package com.greenbasket.nepal.domain.review.service.impl;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.review.dto.ReviewRequest;
import com.greenbasket.nepal.domain.review.dto.ReviewResponse;
import com.greenbasket.nepal.domain.review.dto.ReviewStatsResponse;
import com.greenbasket.nepal.domain.review.entity.Review;
import com.greenbasket.nepal.domain.review.mapper.ReviewMapper;
import com.greenbasket.nepal.domain.review.repository.ReviewRepository;
import com.greenbasket.nepal.domain.review.service.ReviewService;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(Long userId, ReviewRequest request) {
        User customer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        if (!order.getUser().getId().equals(userId)) {
            throw new BadRequestException("This order does not belong to you");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BadRequestException("You can only review products after the order has been delivered");
        }

        boolean productInOrder = order.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(request.getProductId()));
        if (!productInOrder) {
            throw new BadRequestException("This product was not in your order");
        }

        if (reviewRepository.existsByCustomerIdAndProductId(userId, request.getProductId())) {
            throw new BadRequestException("You have already reviewed this product");
        }

        Review review = Review.builder()
                .rating(request.getRating())
                .comment(request.getComment())
                .customer(customer)
                .product(product)
                .order(order)
                .build();

        review = reviewRepository.save(review);

        log.info("Review created: id={}, product={}, customer={}, rating={}",
                review.getId(), product.getId(), userId, request.getRating());

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getProductReviewsPublic(Long productId) {
        return reviewRepository.findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(productId)
                .stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getProductReviews(Long productId, int page, int size, boolean includeHidden) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Review> reviewPage;
        if (productId == null) {
            reviewPage = reviewRepository.findAll(pageable);
        } else if (includeHidden) {
            reviewPage = reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        } else {
            reviewPage = reviewRepository.findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(productId, pageable);
        }

        return toPagedResponse(reviewPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getMyReviews(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage = reviewRepository.findByCustomerIdOrderByCreatedAtDesc(userId, pageable);
        return toPagedResponse(reviewPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getReviewsForMyProducts(Long sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Review> reviewPage = reviewRepository.findByProductSellerId(sellerId, pageable);
        return toPagedResponse(reviewPage);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId, Long userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = review.getCustomer().getId().equals(userId);

        if (!isAdmin && !isOwner) {
            throw new BadRequestException("You do not have permission to delete this review");
        }

        reviewRepository.delete(review);
        log.info("Review deleted: id={} by userId={}", reviewId, userId);
    }

    @Override
    @Transactional
    public void hideReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setVisible(false);
        reviewRepository.save(review);
        log.info("Review hidden: id={}", reviewId);
    }

    @Override
    @Transactional
    public void showReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", reviewId));
        review.setVisible(true);
        reviewRepository.save(review);
        log.info("Review shown: id={}", reviewId);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewStatsResponse getReviewStats(Long productId) {
        double averageRating = reviewRepository.getAverageRatingByProductId(productId);
        long reviewCount = reviewRepository.getReviewCountByProductId(productId);
        return ReviewStatsResponse.builder()
                .averageRating(Math.round(averageRating * 10.0) / 10.0)
                .reviewCount(reviewCount)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasUserReviewedProduct(Long userId, Long productId) {
        return reviewRepository.existsByCustomerIdAndProductId(userId, productId);
    }

    private PagedResponse<ReviewResponse> toPagedResponse(Page<Review> reviewPage) {
        List<ReviewResponse> content = reviewPage.getContent()
                .stream()
                .map(reviewMapper::toResponse)
                .toList();

        return PagedResponse.<ReviewResponse>builder()
                .content(content)
                .page(reviewPage.getNumber())
                .size(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .first(reviewPage.isFirst())
                .last(reviewPage.isLast())
                .build();
    }
}
