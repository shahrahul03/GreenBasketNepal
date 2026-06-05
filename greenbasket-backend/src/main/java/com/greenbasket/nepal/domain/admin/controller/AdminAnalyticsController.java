package com.greenbasket.nepal.domain.admin.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.domain.admin.dto.AnalyticsResponse;
import com.greenbasket.nepal.domain.order.repository.OrderItemRepository;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAnalyticsController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        List<Object[]> monthlyData = orderRepository.getMonthlySalesReport();

        List<AnalyticsResponse.RevenuePerMonth> revenuePerMonth = monthlyData.stream()
                .map(row -> AnalyticsResponse.RevenuePerMonth.builder()
                        .month((String) row[0])
                        .revenue((BigDecimal) row[2])
                        .build())
                .sorted(Comparator.comparing(AnalyticsResponse.RevenuePerMonth::getMonth))
                .toList();

        List<AnalyticsResponse.OrdersPerMonth> ordersPerMonth = monthlyData.stream()
                .map(row -> AnalyticsResponse.OrdersPerMonth.builder()
                        .month((String) row[0])
                        .orderCount(((Number) row[1]).longValue())
                        .build())
                .sorted(Comparator.comparing(AnalyticsResponse.OrdersPerMonth::getMonth))
                .toList();

        List<Object[]> topProductsRaw = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 10));

        List<AnalyticsResponse.TopProduct> topProducts = topProductsRaw.stream()
                .map(row -> AnalyticsResponse.TopProduct.builder()
                        .productId(row[0] != null ? ((Number) row[0]).longValue() : null)
                        .productName((String) row[1])
                        .imageUrl((String) row[2])
                        .totalSold(((Number) row[3]).longValue())
                        .totalRevenue((BigDecimal) row[4])
                        .build())
                .toList();

        List<Object[]> categoryData = productRepository.countByCategory();

        List<AnalyticsResponse.TopCategory> topCategories = categoryData.stream()
                .map(row -> AnalyticsResponse.TopCategory.builder()
                        .categoryName((String) row[0])
                        .productCount(((Number) row[1]).longValue())
                        .totalRevenue(BigDecimal.ZERO)
                        .build())
                .toList();

        List<Object[]> userGrowthRaw = userRepository.getUserGrowthByMonth();

        List<AnalyticsResponse.UserGrowth> userGrowth = userGrowthRaw.stream()
                .map(row -> AnalyticsResponse.UserGrowth.builder()
                        .month((String) row[0])
                        .count(((Number) row[1]).longValue())
                        .build())
                .sorted(Comparator.comparing(AnalyticsResponse.UserGrowth::getMonth))
                .toList();

        List<AnalyticsResponse.TopFarmer> topFarmers = List.of();

        AnalyticsResponse response = AnalyticsResponse.builder()
                .revenuePerMonth(revenuePerMonth)
                .ordersPerMonth(ordersPerMonth)
                .topProducts(topProducts)
                .topFarmers(topFarmers)
                .topCategories(topCategories)
                .userGrowth(userGrowth)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
