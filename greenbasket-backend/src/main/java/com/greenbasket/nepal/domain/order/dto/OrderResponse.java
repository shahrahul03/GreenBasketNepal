package com.greenbasket.nepal.domain.order.dto;

import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long id;
    private String orderNumber;
    private OrderStatus status;
    private BigDecimal subtotal;
    private BigDecimal deliveryCharge;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private String deliveryAddress;
    private String phone;
    private String deliveryNotes;
    private String cancellationReason;

    private LocalDateTime placedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime packedAt;
    private LocalDateTime outForDeliveryAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;

    private CustomerInfo customer;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSlug;
        private String imageUrl;
        private String unit;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
    }
}
