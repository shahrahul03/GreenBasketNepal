package com.greenbasket.nepal.domain.cart.repository;

import com.greenbasket.nepal.domain.cart.entity.Cart;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    @EntityGraph(attributePaths = {"items", "items.product", "items.product.category"})
    Optional<Cart> findByUserId(Long userId);

    Optional<Cart> findByUserIdAndId(Long userId, Long cartId);
}
