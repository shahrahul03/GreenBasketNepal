package com.greenbasket.nepal.domain.product.dto;

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
public class ProductResponse {

    private Long id;
    private String name;
    private String slug;
    private String summary;
    private String description;
    private BigDecimal price;
    private int stock;
    private String unit;

    @JsonProperty("isOrganic")
    private boolean isOrganic;

    @JsonProperty("isAvailable")
    private boolean isAvailable;

    @JsonProperty("isFeatured")
    private boolean isFeatured;

    private int soldCount;

    private String imageUrl;
    private List<ProductImageResponse> images;

    private CategoryInfo category;
    private SellerInfo seller;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SellerInfo {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
    }
}
