package com.greenbasket.nepal.domain.admin.service.impl;

import com.greenbasket.nepal.domain.admin.dto.DashboardStatsResponse;
import com.greenbasket.nepal.domain.admin.service.AdminDashboardService;
import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import com.greenbasket.nepal.domain.order.repository.OrderItemRepository;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        log.debug("Building admin dashboard statistics");

        DashboardStatsResponse.Overview overview = buildOverview();
        DashboardStatsResponse.RevenueSummary revenue = buildRevenueSummary();
        List<DashboardStatsResponse.TopProduct> topProducts = buildTopSellingProducts();
        List<DashboardStatsResponse.MonthlySales> monthlySales = buildMonthlySalesReport();
        List<DashboardStatsResponse.UserGrowth> userGrowth = buildUserGrowth();
        DashboardStatsResponse.ProductStatistics productStats = buildProductStatistics();
        DashboardStatsResponse.OrderStatistics orderStats = buildOrderStatistics();

        return DashboardStatsResponse.builder()
                .overview(overview)
                .revenue(revenue)
                .topSellingProducts(topProducts)
                .monthlySales(monthlySales)
                .userGrowth(userGrowth)
                .productStats(productStats)
                .orderStats(orderStats)
                .build();
    }

    private DashboardStatsResponse.Overview buildOverview() {
        long totalUsers = userRepository.count();
        long totalFarmers = userRepository.countByRoleName("FARMER");
        long totalCustomers = userRepository.countByRoleName("CUSTOMER");
        long totalDeliveryPartners = userRepository.countByRoleName("DELIVERY_PARTNER");
        long totalProducts = productRepository.countActiveProducts();
        long totalOrders = orderRepository.count();

        Map<OrderStatus, Long> statusCounts = orderRepository.countOrdersByStatus()
                .stream()
                .collect(Collectors.toMap(
                        row -> (OrderStatus) row[0],
                        row -> (Long) row[1]));

        long pendingOrders = statusCounts.getOrDefault(OrderStatus.PENDING, 0L);
        long deliveredOrders = statusCounts.getOrDefault(OrderStatus.DELIVERED, 0L);
        long cancelledOrders = statusCounts.getOrDefault(OrderStatus.CANCELLED, 0L);

        return DashboardStatsResponse.Overview.builder()
                .totalUsers(totalUsers)
                .totalFarmers(totalFarmers)
                .totalCustomers(totalCustomers)
                .totalDeliveryPartners(totalDeliveryPartners)
                .totalProducts(totalProducts)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .deliveredOrders(deliveredOrders)
                .cancelledOrders(cancelledOrders)
                .build();
    }

    private DashboardStatsResponse.RevenueSummary buildRevenueSummary() {
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        BigDecimal grossRevenue = orderRepository.getTotalRevenueExcludingCancelled();
        BigDecimal avgOrderValue = orderRepository.getAverageOrderValue();

        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();

        List<Object[]> monthlyData = orderRepository.getMonthlySalesReport();
        String currentMonth = today.format(DateTimeFormatter.ofPattern("yyyy-MM"));

        BigDecimal todayRevenue = orderRepository.getTodayRevenue();
        BigDecimal thisMonthRevenue = BigDecimal.ZERO;

        for (Object[] row : monthlyData) {
            String month = (String) row[0];
            BigDecimal monthRevenue = (BigDecimal) row[2];

            if (month.equals(currentMonth)) {
                thisMonthRevenue = monthRevenue;
            }
        }

        return DashboardStatsResponse.RevenueSummary.builder()
                .totalRevenue(totalRevenue)
                .grossRevenue(grossRevenue)
                .averageOrderValue(avgOrderValue)
                .todayRevenue(todayRevenue)
                .thisMonthRevenue(thisMonthRevenue)
                .pendingPayouts(BigDecimal.ZERO)
                .build();
    }

    private List<DashboardStatsResponse.TopProduct> buildTopSellingProducts() {
        List<Object[]> rawResults = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 10));

        List<DashboardStatsResponse.TopProduct> products = new ArrayList<>();
        for (Object[] row : rawResults) {
            products.add(DashboardStatsResponse.TopProduct.builder()
                    .productId(row[0] != null ? ((Number) row[0]).longValue() : null)
                    .productName((String) row[1])
                    .imageUrl((String) row[2])
                    .totalSold(((Number) row[3]).longValue())
                    .totalRevenue((BigDecimal) row[4])
                    .build());
        }

        return products;
    }

    private List<DashboardStatsResponse.MonthlySales> buildMonthlySalesReport() {
        List<Object[]> rawResults = orderRepository.getMonthlySalesReport();

        return rawResults.stream()
                .map(row -> DashboardStatsResponse.MonthlySales.builder()
                        .month((String) row[0])
                        .orderCount(((Number) row[1]).longValue())
                        .revenue((BigDecimal) row[2])
                        .build())
                .sorted(Comparator.comparing(DashboardStatsResponse.MonthlySales::getMonth))
                .toList();
    }

    private List<DashboardStatsResponse.UserGrowth> buildUserGrowth() {
        List<Object[]> rawResults = userRepository.getUserGrowthByMonth();

        return rawResults.stream()
                .map(row -> DashboardStatsResponse.UserGrowth.builder()
                        .month((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .sorted(Comparator.comparing(DashboardStatsResponse.UserGrowth::getMonth))
                .toList();
    }

    private DashboardStatsResponse.ProductStatistics buildProductStatistics() {
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countActiveProducts();
        long organicProducts = productRepository.countOrganicProducts();
        long outOfStockProducts = productRepository.countOutOfStockProducts();
        long lowStockProducts = productRepository.countLowStockProducts();

        List<Object[]> categoryData = productRepository.countByCategory();
        List<DashboardStatsResponse.CategoryBreakdown> byCategory = categoryData.stream()
                .map(row -> DashboardStatsResponse.CategoryBreakdown.builder()
                        .categoryName((String) row[0])
                        .productCount(((Number) row[1]).longValue())
                        .build())
                .toList();

        return DashboardStatsResponse.ProductStatistics.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .organicProducts(organicProducts)
                .outOfStockProducts(outOfStockProducts)
                .lowStockProducts(lowStockProducts)
                .byCategory(byCategory)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardStatsResponse.RecentActivity> getRecentActivity() {
        List<DashboardStatsResponse.RecentActivity> activities = new ArrayList<>();

        List<User> recentUsers = userRepository.findTop10ByOrderByCreatedAtDesc();
        for (User u : recentUsers) {
            activities.add(DashboardStatsResponse.RecentActivity.builder()
                    .type("USER_REGISTERED")
                    .message(u.getFullName() + " registered as " + u.getRole().getName())
                    .createdAt(u.getCreatedAt().toString())
                    .link("/admin/users/" + u.getId())
                    .build());
        }

        List<Order> recentOrders = orderRepository.findTop10ByOrderByCreatedAtDesc();
        for (Order o : recentOrders) {
            activities.add(DashboardStatsResponse.RecentActivity.builder()
                    .type("ORDER_PLACED")
                    .message("Order " + o.getOrderNumber() + " - " + o.getStatus())
                    .createdAt(o.getCreatedAt().toString())
                    .link("/admin/orders/" + o.getId())
                    .build());
        }

        activities.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return activities.stream().limit(20).toList();
    }

    private DashboardStatsResponse.OrderStatistics buildOrderStatistics() {
        long totalOrders = orderRepository.count();
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        BigDecimal avgOrderValue = orderRepository.getAverageOrderValue();

        List<Object[]> statusCounts = orderRepository.countOrdersByStatus();
        Map<String, Long> statusMap = statusCounts.stream()
                .collect(Collectors.toMap(
                        row -> ((OrderStatus) row[0]).name(),
                        row -> (Long) row[1]));

        return DashboardStatsResponse.OrderStatistics.builder()
                .totalOrders(totalOrders)
                .pendingOrders(statusMap.getOrDefault("PENDING", 0L))
                .confirmedOrders(statusMap.getOrDefault("CONFIRMED", 0L))
                .packingOrders(statusMap.getOrDefault("PACKING", 0L))
                .outForDeliveryOrders(statusMap.getOrDefault("OUT_FOR_DELIVERY", 0L))
                .deliveredOrders(statusMap.getOrDefault("DELIVERED", 0L))
                .cancelledOrders(statusMap.getOrDefault("CANCELLED", 0L))
                .totalRevenue(totalRevenue)
                .averageOrderValue(avgOrderValue)
                .build();
    }
}
