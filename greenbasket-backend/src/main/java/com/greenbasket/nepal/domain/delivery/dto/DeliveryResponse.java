package com.greenbasket.nepal.domain.delivery.dto;

import com.greenbasket.nepal.domain.delivery.entity.DeliveryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryResponse {

    private Long id;
    private DeliveryStatus status;

    private OrderInfo order;
    private DeliveryPartnerInfo deliveryPartner;

    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime onTheWayAt;
    private LocalDateTime deliveredAt;

    private String deliveryNotes;
    private String recipientPhone;
    private String recipientImageUrl;

    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderInfo {
        private Long id;
        private String orderNumber;
        private String customerName;
        private String customerPhone;
        private String deliveryAddress;
        private String deliveryNotes;
        private BigDecimal total;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryPartnerInfo {
        private Long id;
        private String fullName;
        private String phone;
    }
}
