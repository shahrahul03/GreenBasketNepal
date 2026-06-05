package com.greenbasket.nepal.domain.cart.repository;

import com.greenbasket.nepal.domain.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    long countByCartId(Long cartId);

    void deleteByCartId(Long cartId);
}
