package com.greenbasket.nepal.domain.delivery.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.delivery.dto.*;
import com.greenbasket.nepal.domain.delivery.service.DeliveryService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DeliveryController {

    private final DeliveryService deliveryService;

    // ──────────────────────────────────────────────
    //  Delivery Partner endpoints
    // ──────────────────────────────────────────────

    @GetMapping("/api/v1/deliveries/my")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<List<DeliveryResponse>>> getMyActiveDeliveries(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        List<DeliveryResponse> deliveries = deliveryService.getMyActiveDeliveries(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    @GetMapping("/api/v1/deliveries/history")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<PagedResponse<DeliveryResponse>>> getMyHistory(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @ModelAttribute DeliverySearchRequest searchRequest) {
        PagedResponse<DeliveryResponse> deliveries =
                deliveryService.getMyDeliveryHistory(currentUser.getId(), searchRequest);
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }

    @GetMapping("/api/v1/deliveries/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryById(@PathVariable Long id) {
        DeliveryResponse delivery = deliveryService.getDeliveryById(id);
        return ResponseEntity.ok(ApiResponse.success(delivery));
    }

    @GetMapping("/api/v1/deliveries/order/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<DeliveryResponse>> getDeliveryByOrderId(
            @PathVariable Long orderId) {
        DeliveryResponse delivery = deliveryService.getDeliveryByOrderId(orderId);
        return ResponseEntity.ok(ApiResponse.success(delivery));
    }

    @PostMapping("/api/v1/deliveries/{id}/accept")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> acceptDelivery(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        DeliveryResponse delivery = deliveryService.acceptDelivery(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Delivery accepted successfully", delivery));
    }

    @PutMapping("/api/v1/deliveries/{id}/status")
    @PreAuthorize("hasRole('DELIVERY_PARTNER')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> updateStatus(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody DeliveryStatusUpdateRequest request) {
        DeliveryResponse delivery = deliveryService.updateStatus(id, currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Delivery status updated", delivery));
    }

    // ──────────────────────────────────────────────
    //  Admin endpoints
    // ──────────────────────────────────────────────

    @PostMapping("/api/v1/admin/deliveries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DeliveryResponse>> assignDelivery(
            @Valid @RequestBody AssignDeliveryRequest request) {
        DeliveryResponse delivery = deliveryService.assignDelivery(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Delivery assigned successfully", delivery));
    }

    @GetMapping("/api/v1/admin/deliveries")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<DeliveryResponse>>> getAllDeliveries(
            @ModelAttribute DeliverySearchRequest searchRequest) {
        PagedResponse<DeliveryResponse> deliveries = deliveryService.getAllDeliveries(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(deliveries));
    }
}
