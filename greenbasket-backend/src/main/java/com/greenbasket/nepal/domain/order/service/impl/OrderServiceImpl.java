package com.greenbasket.nepal.domain.order.service.impl;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.cart.entity.Cart;
import com.greenbasket.nepal.domain.cart.entity.CartItem;
import com.greenbasket.nepal.domain.cart.repository.CartItemRepository;
import com.greenbasket.nepal.domain.cart.repository.CartRepository;
import com.greenbasket.nepal.domain.order.dto.*;
import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderItem;
import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import com.greenbasket.nepal.domain.order.repository.OrderItemRepository;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.order.service.OrderService;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.email.service.EmailService;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.domain.user.entity.ApprovalStatus;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Implementation of OrderService managing the complete lifecycle of an order.
 * 
 * Flow:
 * 1. Placement: Validate stock -> Deduct stock -> Clear cart -> Notify seller.
 * 2. Processing: Farmer/Admin updates status (PENDING -> CONFIRMED -> PACKING -> etc.).
 * 3. Delivery: Mark as DELIVERED -> Increment product sold counts.
 * 4. Cancellation: Restore stock if cancelled while PENDING or CONFIRMED.
 * 
 * Business Rules:
 * - Free Delivery: Subtotal >= Rs. 500.
 * - Transitions: Strict state machine enforcement via VALID_TRANSITIONS map.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final BigDecimal FREE_DELIVERY_THRESHOLD = new BigDecimal("500");
    private static final BigDecimal DELIVERY_CHARGE = new BigDecimal("50");

    /**
     * State transition matrix ensuring orders follow a logical path.
     * Prevents invalid updates like CANCELLED -> DELIVERED.
     */
    private static final Map<OrderStatus, Set<OrderStatus>> VALID_TRANSITIONS = Map.of(
            OrderStatus.PENDING, Set.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED),
            OrderStatus.CONFIRMED, Set.of(OrderStatus.PACKING, OrderStatus.CANCELLED),
            OrderStatus.PACKING, Set.of(OrderStatus.OUT_FOR_DELIVERY),
            OrderStatus.OUT_FOR_DELIVERY, Set.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, Set.of(),
            OrderStatus.CANCELLED, Set.of()
    );

    private static final Set<OrderStatus> CANCELLABLE_STATUSES = Set.of(
            OrderStatus.PENDING, OrderStatus.CONFIRMED);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final EmailService emailService;

    /**
     * Converts a user's cart into a formal Order.
     * 
     * Transactional Logic:
     * - Validates current stock for every item.
     * - Atomically deducts stock from products.
     * - Empties the user's cart upon successful order creation.
     */
    @Override
    @Transactional
    public OrderResponse placeOrder(Long userId, PlaceOrderRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty. Add items before placing an order."));

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty. Add items before placing an order.");
        }

        validateCartItems(cart);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem cartItem : cart.getItems()) {
            BigDecimal itemSubtotal = cartItem.getUnitPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemSubtotal);
        }

        BigDecimal deliveryCharge = subtotal.compareTo(FREE_DELIVERY_THRESHOLD) >= 0
                ? BigDecimal.ZERO
                : DELIVERY_CHARGE;

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING)
                .deliveryAddress(request.getDeliveryAddress())
                .phone(request.getPhone())
                .deliveryNotes(request.getDeliveryNotes())
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .deliveryCharge(deliveryCharge)
                .discountAmount(BigDecimal.ZERO)
                .total(subtotal.add(deliveryCharge).setScale(2, RoundingMode.HALF_UP))
                .placedAt(LocalDateTime.now())
                .build();

        order = orderRepository.save(order);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();

            product.setStock(product.getStock() - cartItem.getQuantity());
            if (product.getStock() <= 0) {
                product.setAvailable(false);
            }
            productRepository.save(product);

            BigDecimal itemSubtotal = cartItem.getUnitPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productId(product.getId())
                    .productName(product.getName())
                    .productSlug(product.getSlug())
                    .imageUrl(product.getImageUrl())
                    .unit(product.getUnit())
                    .quantity(cartItem.getQuantity())
                    .unitPrice(cartItem.getUnitPrice())
                    .subtotal(itemSubtotal)
                    .build();

            orderItems.add(orderItem);
        }

        orderItems = orderItemRepository.saveAll(orderItems);
        order.setItems(orderItems);
        order = orderRepository.save(order);

        cartItemRepository.deleteByCartId(cart.getId());
        cart.getItems().clear();

        log.info("Order placed: {} by user: {}. Total: {}",
                order.getOrderNumber(), userId, order.getTotal());

        emailService.sendOrderConfirmation(order);
        emailService.sendNewOrderToFarmers(order);

        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getOrderHistory(Long userId, OrderSearchRequest request) {
        Sort sort = Sort.by(request.getSortDirection(), request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Specification<Order> spec = Specification.where((root, query, cb) ->
                cb.equal(root.get("user").get("id"), userId));

        if (request.getStatus() != null) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("status"), request.getStatus()));
        }

        if (request.getOrderNumber() != null && !request.getOrderNumber().isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("orderNumber")),
                            "%" + request.getOrderNumber().toLowerCase() + "%"));
        }

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        return toPagedResponse(orderPage);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long userId, Long orderId, CancelOrderRequest request) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        if (!CANCELLABLE_STATUSES.contains(order.getStatus())) {
            throw new BadRequestException(
                    "Order cannot be cancelled. Current status: " + order.getStatus());
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(LocalDateTime.now());
        order.setCancellationReason(request.getReason() != null ? request.getReason() : "Cancelled by user");
        order = orderRepository.save(order);

        restoreStock(order);

        log.info("Order cancelled: {} by user: {}. Reason: {}",
                order.getOrderNumber(), userId, order.getCancellationReason());

        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        Set<OrderStatus> allowedTransitions = VALID_TRANSITIONS.get(currentStatus);
        if (allowedTransitions == null || !allowedTransitions.contains(newStatus)) {
            throw new BadRequestException(
                    "Cannot transition from " + currentStatus + " to " + newStatus);
        }

        if (newStatus == OrderStatus.CANCELLED && request.getReason() != null) {
            order.setCancellationReason(request.getReason());
        }

        order.setStatus(newStatus);
        setStatusTimestamp(order, newStatus);
        order = orderRepository.save(order);

        if (newStatus == OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        log.info("Order status updated: {} → {} for order: {}",
                currentStatus, newStatus, order.getOrderNumber());

        if (newStatus == OrderStatus.DELIVERED) {
            incrementSoldCount(order);
            emailService.sendOrderDelivered(order);
        } else if (newStatus == OrderStatus.CANCELLED) {
            emailService.sendOrderCancelled(order);
        }

        return toResponse(order);
    }

    private void incrementSoldCount(Order order) {
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() != null) {
                productRepository.findById(item.getProductId()).ifPresent(product -> {
                    product.setSoldCount(product.getSoldCount() + item.getQuantity());
                    productRepository.save(product);
                    log.debug("Incremented soldCount for product {}: +{}", 
                            product.getId(), item.getQuantity());
                });
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean farmerOwnsOrder(Long farmerId, Long orderId) {
        return orderRepository.farmerOwnsOrder(farmerId, orderId);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getFarmerOrders(Long farmerId, OrderSearchRequest request) {
        Sort sort = Sort.by(request.getSortDirection(), request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Order> orderPage = orderRepository.findOrdersBySellerId(farmerId, pageable);

        return toPagedResponse(orderPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> getAllOrders(OrderSearchRequest request) {
        Specification<Order> spec = buildSearchSpecification(request);

        Sort sort = Sort.by(request.getSortDirection(), request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Order> orderPage = orderRepository.findAll(spec, pageable);

        return toPagedResponse(orderPage);
    }

    private void validateCartItems(Cart cart) {
        for (CartItem item : cart.getItems()) {
            Product product = item.getProduct();

            if (product.getDeletedAt() != null || !product.isActive()) {
                throw new BadRequestException(
                        "Product '" + product.getName() + "' is no longer available");
            }

            if (!product.isAvailable()) {
                throw new BadRequestException(
                        "Product '" + product.getName() + "' is out of stock");
            }

            if (item.getQuantity() > product.getStock()) {
                throw new BadRequestException(
                        "Insufficient stock for '" + product.getName() +
                        "'. Available: " + product.getStock() +
                        ", requested: " + item.getQuantity());
            }
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem orderItem : order.getItems()) {
            if (orderItem.getProductId() != null) {
                productRepository.findById(orderItem.getProductId()).ifPresent(product -> {
                    int restoredStock = product.getStock() + orderItem.getQuantity();
                    product.setStock(restoredStock);
                    if (restoredStock > 0) {
                        product.setAvailable(true);
                    }
                    productRepository.save(product);

                    log.debug("Stock restored for product {}: +{}",
                            orderItem.getProductId(), orderItem.getQuantity());
                });
            }
        }
    }

    private void setStatusTimestamp(Order order, OrderStatus status) {
        LocalDateTime now = LocalDateTime.now();
        switch (status) {
            case CONFIRMED -> order.setConfirmedAt(now);
            case PACKING -> order.setPackedAt(now);
            case OUT_FOR_DELIVERY -> order.setOutForDeliveryAt(now);
            case DELIVERED -> order.setDeliveredAt(now);
            case CANCELLED -> order.setCancelledAt(now);
        }
    }

    private Specification<Order> buildSearchSpecification(OrderSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getOrderNumber() != null && !request.getOrderNumber().isBlank()) {
                predicates.add(cb.like(root.get("orderNumber"), "%" + request.getOrderNumber() + "%"));
            }

            if (request.getUserId() != null) {
                predicates.add(cb.equal(root.get("user").get("id"), request.getUserId()));
            }

            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String generateOrderNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        int randomPart = ThreadLocalRandom.current().nextInt(100, 999);
        return "ORD-" + datePart + "-" + randomPart;
    }

    private PagedResponse<OrderResponse> toPagedResponse(Page<Order> orderPage) {
        List<OrderResponse> orders = orderPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        return PagedResponse.<OrderResponse>builder()
                .content(orders)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .first(orderPage.isFirst())
                .last(orderPage.isLast())
                .build();
    }

    private OrderResponse toResponse(Order order) {
        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProductId())
                        .productName(item.getProductName())
                        .productSlug(item.getProductSlug())
                        .imageUrl(item.getImageUrl())
                        .unit(item.getUnit())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .deliveryCharge(order.getDeliveryCharge())
                .discountAmount(order.getDiscountAmount())
                .total(order.getTotal())
                .deliveryAddress(order.getDeliveryAddress())
                .phone(order.getPhone())
                .deliveryNotes(order.getDeliveryNotes())
                .cancellationReason(order.getCancellationReason())
                .placedAt(order.getPlacedAt())
                .confirmedAt(order.getConfirmedAt())
                .packedAt(order.getPackedAt())
                .outForDeliveryAt(order.getOutForDeliveryAt())
                .deliveredAt(order.getDeliveredAt())
                .cancelledAt(order.getCancelledAt())
                .customer(OrderResponse.CustomerInfo.builder()
                        .id(order.getUser().getId())
                        .fullName(order.getUser().getFullName())
                        .email(order.getUser().getEmail())
                        .phone(order.getUser().getPhone())
                        .build())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
