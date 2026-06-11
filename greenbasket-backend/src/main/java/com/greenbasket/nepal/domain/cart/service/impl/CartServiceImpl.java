package com.greenbasket.nepal.domain.cart.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.cart.dto.AddToCartRequest;
import com.greenbasket.nepal.domain.cart.dto.CartResponse;
import com.greenbasket.nepal.domain.cart.dto.UpdateCartItemRequest;
import com.greenbasket.nepal.domain.cart.entity.Cart;
import com.greenbasket.nepal.domain.cart.entity.CartItem;
import com.greenbasket.nepal.domain.cart.repository.CartItemRepository;
import com.greenbasket.nepal.domain.cart.repository.CartRepository;
import com.greenbasket.nepal.domain.cart.service.CartService;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));
        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.isAvailable() || !product.isActive() || product.getDeletedAt() != null) {
            throw new BadRequestException("Product is not available");
        }

        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> createNewCart(userId));

        cartItemRepository.findByCartIdAndProductId(cart.getId(), request.getProductId())
                .ifPresentOrElse(
                        existing -> {
                            int newQty = existing.getQuantity() + request.getQuantity();
                            if (newQty > product.getStock()) {
                                throw new BadRequestException(
                                        "Insufficient stock. Available: " + product.getStock());
                            }
                            existing.setQuantity(newQty);
                            existing.setUnitPrice(product.getPrice());
                            cartItemRepository.save(existing);
                        },
                        () -> {
                            if (request.getQuantity() > product.getStock()) {
                                throw new BadRequestException(
                                        "Insufficient stock. Available: " + product.getStock());
                            }
                            CartItem item = CartItem.builder()
                                    .cart(cart)
                                    .product(product)
                                    .quantity(request.getQuantity())
                                    .unitPrice(product.getPrice())
                                    .build();
                            cart.getItems().add(item);
                            cartItemRepository.save(item);
                        });

        log.info("Item added to cart. User: {}, Product: {}, Qty: {}",
                userId, request.getProductId(), request.getQuantity());

        return toResponse(cartRepository.findByUserId(userId).orElse(cart));
    }

    @Override
    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        Product product = item.getProduct();
        if (request.getQuantity() > product.getStock()) {
            throw new BadRequestException(
                    "Insufficient stock. Available: " + product.getStock());
        }

        item.setQuantity(request.getQuantity());
        item.setUnitPrice(product.getPrice());
        cartItemRepository.save(item);

        log.info("Cart item updated. User: {}, Item: {}, Qty: {}",
                userId, itemId, request.getQuantity());

        return toResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long itemId) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Item does not belong to your cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        log.info("Item removed from cart. User: {}, Item: {}", userId, itemId);

        return toResponse(cart);
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cartItemRepository.deleteByCartId(cart.getId());
            cart.getItems().clear();
            log.info("Cart cleared. User: {}", userId);
        });
    }

    private Cart createNewCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = Cart.builder()
                .user(user)
                .build();

        return cartRepository.save(cart);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartResponse.CartItemResponse> itemResponses = cart.getItems().stream()
                .map(this::toItemResponse)
                .toList();

        BigDecimal subtotal = itemResponses.stream()
                .map(CartResponse.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .totalItems(cart.getItems().size())
                .subtotal(subtotal)
                .items(itemResponses)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }

    private CartResponse.CartItemResponse toItemResponse(CartItem item) {
        Product product = item.getProduct();
        BigDecimal subtotal = item.getUnitPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartResponse.CartItemResponse.builder()
                .id(item.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .imageUrl(product.getImageUrl())
                .unit(product.getUnit())
                .unitPrice(item.getUnitPrice())
                .quantity(item.getQuantity())
                .subtotal(subtotal)
                .isAvailable(product.isAvailable() && product.isActive()
                        && product.getDeletedAt() == null)
                .availableStock(product.getStock())
                .build();
    }
}
