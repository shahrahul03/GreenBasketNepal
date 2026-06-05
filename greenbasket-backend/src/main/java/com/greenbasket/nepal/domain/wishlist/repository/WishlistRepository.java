package com.greenbasket.nepal.domain.wishlist.repository;

import com.greenbasket.nepal.domain.wishlist.entity.Wishlist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {

    @EntityGraph(attributePaths = {"product", "product.category"})
    List<Wishlist> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"product"})
    Optional<Wishlist> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);

    long countByUserId(Long userId);

    void deleteByUserIdAndProductId(Long userId, Long productId);
}
