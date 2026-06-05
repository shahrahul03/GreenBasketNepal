package com.greenbasket.nepal.domain.review.repository;

import com.greenbasket.nepal.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(Long productId);

    Page<Review> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Page<Review> findByProductIdAndIsVisibleTrueOrderByCreatedAtDesc(Long productId, Pageable pageable);

    Page<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);

    Optional<Review> findByCustomerIdAndProductId(Long customerId, Long productId);

    boolean existsByCustomerIdAndProductId(Long customerId, Long productId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.product.id = :productId AND r.isVisible = true")
    double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId AND r.isVisible = true")
    long getReviewCountByProductId(@Param("productId") Long productId);

    @Query("SELECT r FROM Review r WHERE r.product.id IN " +
           "(SELECT p.id FROM Product p WHERE p.seller.id = :sellerId) " +
           "ORDER BY r.createdAt DESC")
    Page<Review> findByProductSellerId(@Param("sellerId") Long sellerId, Pageable pageable);
}
