package com.greenbasket.nepal.domain.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {

    private List<RevenuePerMonth> revenuePerMonth;
    private List<OrdersPerMonth> ordersPerMonth;
    private List<TopProduct> topProducts;
    private List<TopFarmer> topFarmers;
    private List<TopCategory> topCategories;
    private List<UserGrowth> userGrowth;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenuePerMonth {
        private String month;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrdersPerMonth {
        private String month;
        private long orderCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopProduct {
        private Long productId;
        private String productName;
        private String imageUrl;
        private long totalSold;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopFarmer {
        private Long farmerId;
        private String farmerName;
        private String email;
        private long totalProducts;
        private long totalOrders;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopCategory {
        private String categoryName;
        private long productCount;
        private BigDecimal totalRevenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserGrowth {
        private String month;
        private long count;
    }
}
