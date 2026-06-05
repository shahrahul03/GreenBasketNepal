package com.greenbasket.nepal.domain.cart.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class CartResponse {

    private Long id;
    private Long userId;
    private int totalItems;
    private BigDecimal subtotal;
    private List<CartItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItemResponse {

        private Long id;
        private Long productId;
        private String productName;
        private String productSlug;
        private String imageUrl;
        private String unit;
        private BigDecimal unitPrice;
        private int quantity;
        private BigDecimal subtotal;
        @JsonProperty("isAvailable")
        private boolean isAvailable;
        private int availableStock;
    }
}
