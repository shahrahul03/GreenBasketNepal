package com.greenbasket.nepal.domain.cart.service;

import com.greenbasket.nepal.domain.cart.dto.AddToCartRequest;
import com.greenbasket.nepal.domain.cart.dto.CartResponse;
import com.greenbasket.nepal.domain.cart.dto.UpdateCartItemRequest;

public interface CartService {

    CartResponse getCart(Long userId);

    CartResponse addItem(Long userId, AddToCartRequest request);

    CartResponse updateItemQuantity(Long userId, Long itemId, UpdateCartItemRequest request);

    CartResponse removeItem(Long userId, Long itemId);

    void clearCart(Long userId);
}
