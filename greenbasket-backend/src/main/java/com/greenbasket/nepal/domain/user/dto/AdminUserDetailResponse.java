package com.greenbasket.nepal.domain.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.greenbasket.nepal.domain.order.dto.OrderResponse;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDetailResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private String avatarUrl;

    @JsonProperty("isEmailVerified")
    private boolean isEmailVerified;

    @JsonProperty("isActive")
    private boolean isActive;

    @JsonProperty("isLocked")
    private boolean isLocked;

    @JsonProperty("isSuspended")
    private boolean isSuspended;

    private String approvalStatus;
    private int failedLoginAttempts;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime suspendedAt;
    private LocalDateTime deletedAt;

    private List<OrderResponse> recentOrders;
    private List<ProductResponse> products;
    private long totalOrders;
    private long totalProducts;
}
