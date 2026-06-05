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
public class DashboardStatsResponse {

    private Overview overview;
    private RevenueSummary revenue;
    private List<TopProduct> topSellingProducts;
    private List<MonthlySales> monthlySales;
    private List<UserGrowth> userGrowth;
    private ProductStatistics productStats;
    private OrderStatistics orderStats;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Overview {
        private long totalUsers;
        private long totalFarmers;
        private long totalCustomers;
        private long totalDeliveryPartners;
        private long totalProducts;
        private long totalOrders;
        private long pendingOrders;
        private long deliveredOrders;
        private long cancelledOrders;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RevenueSummary {
        private BigDecimal totalRevenue;
        private BigDecimal grossRevenue;
        private BigDecimal averageOrderValue;
        private BigDecimal todayRevenue;
        private BigDecimal thisMonthRevenue;
        private BigDecimal pendingPayouts;
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
    public static class MonthlySales {
        private String month;
        private long orderCount;
        private BigDecimal revenue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserGrowth {
        private String month;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductStatistics {
        private long totalProducts;
        private long activeProducts;
        private long organicProducts;
        private long outOfStockProducts;
        private long lowStockProducts;
        private List<CategoryBreakdown> byCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryBreakdown {
        private String categoryName;
        private long productCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String type;
        private String message;
        private String createdAt;
        private String link;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderStatistics {
        private long totalOrders;
        private long pendingOrders;
        private long confirmedOrders;
        private long packingOrders;
        private long outForDeliveryOrders;
        private long deliveredOrders;
        private long cancelledOrders;
        private BigDecimal totalRevenue;
        private BigDecimal averageOrderValue;
    }
}
