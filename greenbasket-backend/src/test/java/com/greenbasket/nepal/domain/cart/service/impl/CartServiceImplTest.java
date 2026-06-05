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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;

    private CartService cartService;
    private User customer;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        cartService = new CartServiceImpl(cartRepository, cartItemRepository, productRepository, userRepository);

        customer = User.builder().id(1L).fullName("Test User").build();

        product = Product.builder()
                .id(1L).name("Test Product").slug("test-product").unit("kg")
                .price(new BigDecimal("100")).stock(10).isAvailable(true).isActive(true)
                .seller(User.builder().id(2L).build())
                .build();

        cart = Cart.builder()
                .id(1L).user(customer)
                .items(new ArrayList<>())
                .build();
    }

    @Test
    void getCart_shouldReturnExistingCart() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        CartResponse response = cartService.getCart(1L);

        assertNotNull(response);
    }

    @Test
    void getCart_shouldThrowWhenNoCart() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.getCart(1L));
    }

    @Test
    void addItem_shouldAddNewItemToCart() {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQuantity(2);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(1L, 1L)).thenReturn(Optional.empty());

        cartService.addItem(1L, request);

        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getItems().get(0).getQuantity());
    }

    @Test
    void addItem_shouldThrowWhenProductUnavailable() {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQuantity(1);

        product.setActive(false);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(BadRequestException.class, () -> cartService.addItem(1L, request));
    }

    @Test
    void addItem_shouldThrowWhenProductOutOfStock() {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQuantity(1);

        product.setAvailable(false);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThrows(BadRequestException.class, () -> cartService.addItem(1L, request));
    }

    @Test
    void addItem_shouldThrowWhenQuantityExceedsStock() {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQuantity(20);

        product.setStock(5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        assertThrows(BadRequestException.class, () -> cartService.addItem(1L, request));
    }

    @Test
    void addItem_shouldThrowWhenProductNotFound() {
        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(99L);
        request.setQuantity(1);

        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.addItem(1L, request));
    }

    @Test
    void addItem_shouldIncreaseQuantityIfAlreadyInCart() {
        CartItem existingItem = CartItem.builder()
                .id(1L).cart(cart).product(product).quantity(1)
                .unitPrice(new BigDecimal("100"))
                .build();
        cart.getItems().add(existingItem);

        AddToCartRequest request = new AddToCartRequest();
        request.setProductId(1L);
        request.setQuantity(2);

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findByCartIdAndProductId(1L, 1L)).thenReturn(Optional.of(existingItem));

        cartService.addItem(1L, request);

        assertEquals(3, existingItem.getQuantity());
        verify(cartItemRepository).save(existingItem);
    }

    @Test
    void updateItemQuantity_shouldUpdate() {
        CartItem item = CartItem.builder()
                .id(1L).cart(cart).product(product).quantity(2)
                .unitPrice(new BigDecimal("100"))
                .build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQuantity(5);

        cartService.updateItemQuantity(1L, 1L, request);

        assertEquals(5, item.getQuantity());
    }

    @Test
    void updateItemQuantity_shouldThrowWhenQuantityExceedsStock() {
        CartItem item = CartItem.builder()
                .id(1L).cart(cart).product(product).quantity(2)
                .unitPrice(new BigDecimal("100"))
                .build();
        cart.getItems().add(item);

        product.setStock(3);
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));

        UpdateCartItemRequest request = new UpdateCartItemRequest();
        request.setQuantity(10);

        assertThrows(BadRequestException.class,
                () -> cartService.updateItemQuantity(1L, 1L, request));
    }

    @Test
    void removeItem_shouldRemove() {
        CartItem item = CartItem.builder()
                .id(1L).cart(cart).product(product).quantity(2)
                .unitPrice(new BigDecimal("100"))
                .build();
        cart.getItems().add(item);

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));

        cartService.removeItem(1L, 1L);

        assertTrue(cart.getItems().isEmpty());
        verify(cartItemRepository).delete(item);
    }

    @Test
    void removeItem_shouldThrowWhenItemNotInUsersCart() {
        Cart otherCart = Cart.builder().id(99L).user(customer).items(new ArrayList<>()).build();
        CartItem item = CartItem.builder()
                .id(1L).cart(otherCart).product(product).quantity(2)
                .unitPrice(new BigDecimal("100"))
                .build();

        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(item));

        assertThrows(BadRequestException.class, () -> cartService.removeItem(1L, 1L));
    }

    @Test
    void clearCart_shouldClear() {
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));

        cartService.clearCart(1L);

        verify(cartItemRepository).deleteByCartId(1L);
    }
}
