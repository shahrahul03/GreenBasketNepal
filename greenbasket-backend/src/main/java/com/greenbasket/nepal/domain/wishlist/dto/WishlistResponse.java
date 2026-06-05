package com.greenbasket.nepal.domain.wishlist.dto;

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
public class WishlistResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String imageUrl;
    private BigDecimal price;
    private String unit;
    private boolean isOrganic;
    private boolean isAvailable;
    private String categoryName;
    private String notes;
    private LocalDateTime createdAt;
}
