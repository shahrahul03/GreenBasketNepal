package com.greenbasket.nepal.domain.order.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.cart.entity.Cart;
import com.greenbasket.nepal.domain.cart.entity.CartItem;
import com.greenbasket.nepal.domain.cart.repository.CartItemRepository;
import com.greenbasket.nepal.domain.cart.repository.CartRepository;
import com.greenbasket.nepal.domain.order.dto.CancelOrderRequest;
import com.greenbasket.nepal.domain.order.dto.OrderResponse;
import com.greenbasket.nepal.domain.order.dto.OrderStatusUpdateRequest;
import com.greenbasket.nepal.domain.order.dto.PlaceOrderRequest;
import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderItem;
import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import com.greenbasket.nepal.domain.order.repository.OrderItemRepository;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.order.service.OrderService;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.email.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock private OrderRepository orderRepository;
    @Mock private OrderItemRepository orderItemRepository;
    @Mock private ProductRepository productRepository;
    @Mock private UserRepository userRepository;
    @Mock private CartRepository cartRepository;
    @Mock private CartItemRepository cartItemRepository;
    @Mock private EmailService emailService;

    private OrderService orderService;
    private User customer;
    private Product product;
    private Cart cart;
    private CartItem cartItem;

    @BeforeEach
    void setUp() {
        orderService = new OrderServiceImpl(
                orderRepository, orderItemRepository, productRepository,
                userRepository, cartRepository, cartItemRepository, emailService
        );

        customer = User.builder().id(1L).fullName("Test User").email("user@test.com").phone("9812345678").build();

        product = Product.builder()
                .id(1L).name("Test Product").slug("test-product").unit("kg")
                .price(new BigDecimal("100")).stock(10).isAvailable(true).isActive(true)
                .seller(customer)
                .build();

        cartItem = CartItem.builder()
                .id(1L).product(product)
                .unitPrice(new BigDecimal("100")).quantity(2)
                .build();

        cart = Cart.builder().id(1L).user(customer).items(new ArrayList<>(List.of(cartItem))).build();
    }

    @Test
    void placeOrder_shouldCreateOrderFromCart() {
        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .deliveryAddress("Test Address").phone("9812345678").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            o.setOrderNumber("ORD-20240101-120000-123");
            o.setItems(List.of(
                    OrderItem.builder().id(1L).productId(1L).productName("Test Product")
                            .quantity(2).unitPrice(new BigDecimal("100"))
                            .subtotal(new BigDecimal("200")).build()
            ));
            return o;
        });
        when(orderItemRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        OrderResponse response = orderService.placeOrder(1L, request);

        assertNotNull(response);
        verify(cartItemRepository).deleteByCartId(1L);
        verify(emailService).sendOrderConfirmation(any(Order.class));
        verify(emailService).sendNewOrderToFarmers(any(Order.class));
    }

    @Test
    void placeOrder_shouldThrowWhenCartEmpty() {
        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .deliveryAddress("Addr").phone("9812345678").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(
                Cart.builder().id(1L).user(customer).items(List.of()).build()
        ));

        assertThrows(BadRequestException.class, () -> orderService.placeOrder(1L, request));
    }

    @Test
    void placeOrder_shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.placeOrder(99L, PlaceOrderRequest.builder()
                        .deliveryAddress("Addr").phone("9812345678").build()));
    }

    @Test
    void placeOrder_shouldThrowWhenNoCart() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class,
                () -> orderService.placeOrder(1L, PlaceOrderRequest.builder()
                        .deliveryAddress("Addr").phone("9812345678").build()));
    }

    @Test
    void placeOrder_shouldDecreaseStock() {
        PlaceOrderRequest request = PlaceOrderRequest.builder()
                .deliveryAddress("Addr").phone("9812345678").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(cart));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(1L);
            o.setOrderNumber("ORD-TEST");
            return o;
        });
        when(orderItemRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
        when(productRepository.save(any(Product.class))).thenReturn(product);

        orderService.placeOrder(1L, request);

        assertEquals(8, product.getStock());
        verify(productRepository, atLeastOnce()).save(product);
    }

    @Test
    void cancelOrder_shouldCancelPendingOrder() {
        Order order = Order.builder().id(1L).user(customer).status(OrderStatus.PENDING)
                .orderNumber("ORD-123").subtotal(new BigDecimal("200"))
                .deliveryCharge(new BigDecimal("50")).discountAmount(BigDecimal.ZERO)
                .total(new BigDecimal("250")).deliveryAddress("Addr").placedAt(LocalDateTime.now())
                .items(List.of(
                        OrderItem.builder().id(1L).productId(1L).quantity(2).build()
                )).build();

        when(orderRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(order));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> inv.getArgument(0));

        CancelOrderRequest request = new CancelOrderRequest();
        request.setReason("Changed mind");

        OrderResponse response = orderService.cancelOrder(1L, 1L, request);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
    }

    @Test
    void updateOrderStatus_shouldTransitionCorrectly() {
        Order order = Order.builder().id(1L).user(customer).status(OrderStatus.PENDING)
                .orderNumber("ORD-123").subtotal(new BigDecimal("200"))
                .deliveryCharge(new BigDecimal("50")).discountAmount(BigDecimal.ZERO)
                .total(new BigDecimal("250")).deliveryAddress("Addr")
                .build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest();
        request.setStatus(OrderStatus.CONFIRMED);

        OrderResponse response = orderService.updateOrderStatus(1L, request);

        assertEquals(OrderStatus.CONFIRMED, order.getStatus());
    }

    @Test
    void updateOrderStatus_shouldThrowForInvalidTransition() {
        Order order = Order.builder().id(1L).user(customer).status(OrderStatus.PENDING).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest();
        request.setStatus(OrderStatus.DELIVERED);

        assertThrows(BadRequestException.class,
                () -> orderService.updateOrderStatus(1L, request));
    }

    @Test
    void updateOrderStatus_shouldRestoreStockOnCancellation() {
        Order order = Order.builder().id(1L).user(customer).status(OrderStatus.PENDING)
                .orderNumber("ORD-123").subtotal(new BigDecimal("200"))
                .deliveryCharge(new BigDecimal("50")).discountAmount(BigDecimal.ZERO)
                .total(new BigDecimal("250")).deliveryAddress("Addr")
                .items(List.of(
                        OrderItem.builder().id(1L).productId(1L).quantity(2).build()
                )).build();

        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        product.setStock(8);

        OrderStatusUpdateRequest request = new OrderStatusUpdateRequest();
        request.setStatus(OrderStatus.CANCELLED);

        orderService.updateOrderStatus(1L, request);

        assertEquals(10, product.getStock());
        verify(emailService).sendOrderCancelled(any(Order.class));
    }

    @Test
    void getOrderById_shouldReturnOrder() {
        Order order = Order.builder().id(1L).user(customer).status(OrderStatus.PENDING)
                .orderNumber("ORD-123").build();

        when(orderRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(order));

        OrderResponse response = orderService.getOrderById(1L, 1L);

        assertNotNull(response);
    }

    @Test
    void getOrderById_shouldThrowWhenNotFound() {
        when(orderRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> orderService.getOrderById(99L, 1L));
    }
}
