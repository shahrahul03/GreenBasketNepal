package com.greenbasket.nepal.domain.review.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderItem;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.greenbasket.nepal.domain.user.entity.Role;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock private ReviewRepository reviewRepository;
    @Mock private ReviewMapper reviewMapper;
    @Mock private OrderRepository orderRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    private ReviewService reviewService;
    private User customer;
    private User farmer;
    private Product product;
    private Order order;
    private Review review;

    @BeforeEach
    void setUp() {
        reviewService = new ReviewServiceImpl(
                reviewRepository, reviewMapper, userRepository, productRepository, orderRepository
        );

        customer = User.builder().id(1L).fullName("Customer").role(Role.builder().id(1L).name("CUSTOMER").build()).build();
        farmer = User.builder().id(2L).fullName("Farmer").build();

        product = Product.builder().id(1L).name("Test Product").seller(farmer).build();

        order = Order.builder()
                .id(1L).user(customer).status(OrderStatus.DELIVERED)
                .items(List.of(OrderItem.builder().productId(1L).build()))
                .build();

        review = Review.builder()
                .id(1L).product(product).customer(customer).order(order).rating(5)
                .comment("Great product!")
                .build();
    }

    @Test
    void createReview_shouldCreate() {
        ReviewRequest request = new ReviewRequest();
        request.setProductId(1L);
        request.setOrderId(1L);
        request.setRating(4);
        request.setComment("Good product");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByCustomerIdAndProductId(1L, 1L)).thenReturn(false);
        when(reviewRepository.save(any(Review.class))).thenAnswer(inv -> {
            Review r = inv.getArgument(0);
            r.setId(2L);
            return r;
        });
        when(reviewMapper.toResponse(any(Review.class))).thenReturn(
                ReviewResponse.builder().id(2L).rating(4).build()
        );

        ReviewResponse response = reviewService.createReview(1L, request);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        verify(reviewRepository).save(any(Review.class));
    }

    @Test
    void createReview_shouldThrowWhenDuplicate() {
        ReviewRequest request = new ReviewRequest();
        request.setProductId(1L);
        request.setOrderId(1L);
        request.setRating(5);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(reviewRepository.existsByCustomerIdAndProductId(1L, 1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> reviewService.createReview(1L, request));
    }

    @Test
    void createReview_shouldThrowWhenOrderNotDelivered() {
        Order pendingOrder = Order.builder()
                .id(2L).user(customer).status(OrderStatus.PENDING)
                .items(List.of(OrderItem.builder().productId(1L).build()))
                .build();

        ReviewRequest request = new ReviewRequest();
        request.setProductId(1L);
        request.setOrderId(2L);
        request.setRating(4);
        request.setComment("Nice");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(orderRepository.findById(2L)).thenReturn(Optional.of(pendingOrder));

        assertThrows(BadRequestException.class, () -> reviewService.createReview(1L, request));
    }

    @Test
    void createReview_shouldThrowWhenProductNotFound() {
        ReviewRequest request = new ReviewRequest();
        request.setProductId(99L);
        request.setOrderId(1L);
        request.setRating(5);
        request.setComment("Good");

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reviewService.createReview(1L, request));
    }

    @Test
    void getProductReviewsPublic_shouldReturnVisible() {
        when(reviewRepository.findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(review));
        when(reviewMapper.toResponse(any(Review.class))).thenReturn(
                ReviewResponse.builder().id(1L).build()
        );

        List<ReviewResponse> result = reviewService.getProductReviewsPublic(1L);

        assertEquals(1, result.size());
    }

    @Test
    void getReviewStats_shouldReturnStats() {
        when(reviewRepository.getAverageRatingByProductId(1L)).thenReturn(5.0);
        when(reviewRepository.getReviewCountByProductId(1L)).thenReturn(1L);

        ReviewStatsResponse stats = reviewService.getReviewStats(1L);

        assertEquals(5.0, stats.getAverageRating());
        assertEquals(1, stats.getReviewCount());
    }

    @Test
    void getReviewStats_shouldReturnZerosWhenNoReviews() {
        when(reviewRepository.getAverageRatingByProductId(1L)).thenReturn(0.0);
        when(reviewRepository.getReviewCountByProductId(1L)).thenReturn(0L);

        ReviewStatsResponse stats = reviewService.getReviewStats(1L);

        assertEquals(0.0, stats.getAverageRating());
        assertEquals(0, stats.getReviewCount());
    }

    @Test
    void hasUserReviewedProduct_shouldReturnTrue() {
        when(reviewRepository.existsByCustomerIdAndProductId(1L, 1L)).thenReturn(true);

        assertTrue(reviewService.hasUserReviewedProduct(1L, 1L));
    }

    @Test
    void deleteReview_shouldDeleteByOwner() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));

        reviewService.deleteReview(1L, 1L);

        verify(reviewRepository).delete(review);
    }

    @Test
    void deleteReview_shouldThrowWhenNotOwner() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(userRepository.findById(99L)).thenReturn(Optional.of(User.builder()
                .id(99L).fullName("Other").role(Role.builder().id(2L).name("CUSTOMER").build()).build()));

        assertThrows(BadRequestException.class, () -> reviewService.deleteReview(1L, 99L));
    }

    @Test
    void hideReview_shouldHide() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        reviewService.hideReview(1L);

        assertFalse(review.isVisible());
    }

    @Test
    void showReview_shouldShow() {
        review.setVisible(false);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(reviewRepository.save(any(Review.class))).thenReturn(review);

        reviewService.showReview(1L);

        assertTrue(review.isVisible());
    }
}
