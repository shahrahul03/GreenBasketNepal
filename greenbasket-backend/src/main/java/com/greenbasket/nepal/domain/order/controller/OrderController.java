package com.greenbasket.nepal.domain.order.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.order.dto.*;
import com.greenbasket.nepal.domain.order.service.OrderService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ──────────────────────────────────────────────
    //  User endpoints
    // ──────────────────────────────────────────────

    @PostMapping("/api/v1/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody PlaceOrderRequest request) {
        OrderResponse order = orderService.placeOrder(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", order));
    }

    @GetMapping("/api/v1/orders")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getOrderHistory(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @ModelAttribute OrderSearchRequest searchRequest) {
        PagedResponse<OrderResponse> orders = orderService.getOrderHistory(
                currentUser.getId(), searchRequest);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @GetMapping("/api/v1/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @PathVariable Long id) {
        OrderResponse order = orderService.getOrderById(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(order));
    }

    @PostMapping("/api/v1/orders/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CancelOrderRequest request) {
        if (request == null) {
            request = new CancelOrderRequest();
        }
        OrderResponse order = orderService.cancelOrder(currentUser.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", order));
    }

    // ──────────────────────────────────────────────
    //  Admin endpoints
    // ──────────────────────────────────────────────

    @GetMapping("/api/v1/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getAllOrders(
            @ModelAttribute OrderSearchRequest searchRequest) {
        PagedResponse<OrderResponse> orders = orderService.getAllOrders(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/api/v1/admin/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse order = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }
}
