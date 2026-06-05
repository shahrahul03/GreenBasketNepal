package com.greenbasket.nepal.domain.cart.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.domain.cart.dto.AddToCartRequest;
import com.greenbasket.nepal.domain.cart.dto.CartResponse;
import com.greenbasket.nepal.domain.cart.dto.UpdateCartItemRequest;
import com.greenbasket.nepal.domain.cart.service.CartService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        CartResponse cart = cartService.getCart(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(cart));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody AddToCartRequest request) {
        CartResponse cart = cartService.addItem(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item added to cart", cart));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItemQuantity(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse cart = cartService.updateItemQuantity(currentUser.getId(), itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", cart));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @PathVariable Long itemId) {
        CartResponse cart = cartService.removeItem(currentUser.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cart));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        cartService.clearCart(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
