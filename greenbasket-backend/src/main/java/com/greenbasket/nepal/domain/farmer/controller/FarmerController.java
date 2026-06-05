package com.greenbasket.nepal.domain.farmer.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.order.dto.OrderResponse;
import com.greenbasket.nepal.domain.order.dto.OrderSearchRequest;
import com.greenbasket.nepal.domain.order.dto.OrderStatusUpdateRequest;
import com.greenbasket.nepal.domain.order.service.OrderService;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import com.greenbasket.nepal.domain.product.dto.ProductSearchRequest;
import com.greenbasket.nepal.domain.product.service.ProductService;
import com.greenbasket.nepal.domain.user.dto.ChangePasswordRequest;
import com.greenbasket.nepal.domain.user.dto.UpdateProfileRequest;
import com.greenbasket.nepal.domain.user.dto.UserProfileResponse;
import com.greenbasket.nepal.domain.user.service.UserService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;

@RestController
@RequestMapping("/api/v1/farmer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerController {

    private final ProductService productService;
    private final OrderService orderService;
    private final UserService userService;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        Long farmerId = currentUser.getId();

        ProductSearchRequest productSearch = ProductSearchRequest.builder()
                .sellerId(farmerId)
                .page(0)
                .size(1)
                .build();
        var products = productService.searchProducts(productSearch);

        OrderSearchRequest orderSearch = OrderSearchRequest.builder()
                .page(0)
                .size(1)
                .build();
        var orders = orderService.getFarmerOrders(farmerId, orderSearch);

        List<com.greenbasket.nepal.domain.product.entity.Product> allProducts = productRepository.findBySellerId(farmerId);
        long totalProducts = allProducts.size();
        long activeProducts = allProducts.stream()
                .filter(p -> p.isActive() && p.isAvailable()).count();
        long inactiveProducts = totalProducts - activeProducts;
        long lowStock = allProducts.stream().filter(p -> p.getStock() > 0 && p.getStock() <= 10).count();
        long outOfStock = allProducts.stream().filter(p -> p.getStock() <= 0).count();
        long pendingOrders = orders.getTotalElements();
        BigDecimal todayRevenue = orderRepository.getFarmerTodayRevenue(farmerId);
        BigDecimal monthRevenue = orderRepository.getFarmerMonthRevenue(farmerId);

        List<Map<String, Object>> lowStockAlerts = new ArrayList<>();
        allProducts.stream()
                .filter(p -> p.getStock() <= 10)
                .forEach(p -> {
                    Map<String, Object> alert = new LinkedHashMap<>();
                    alert.put("productId", p.getId());
                    alert.put("productName", p.getName());
                    alert.put("slug", p.getSlug());
                    alert.put("stock", p.getStock());
                    lowStockAlerts.add(alert);
                });

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProducts", totalProducts);
        stats.put("activeProducts", activeProducts);
        stats.put("inactiveProducts", inactiveProducts);
        stats.put("totalOrders", pendingOrders);
        stats.put("lowStockProducts", lowStock);
        stats.put("outOfStockProducts", outOfStock);
        stats.put("todayRevenue", todayRevenue);
        stats.put("monthRevenue", monthRevenue);
        stats.put("lowStockAlerts", lowStockAlerts);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        Long farmerId = currentUser.getId();

        BigDecimal totalRevenue = orderRepository.getFarmerTotalRevenue(farmerId);
        BigDecimal todayRevenue = orderRepository.getFarmerTodayRevenue(farmerId);
        BigDecimal monthRevenue = orderRepository.getFarmerMonthRevenue(farmerId);

        List<Map<String, Object>> monthlySales = new ArrayList<>();
        List<Object[]> rawMonthly = orderRepository.getFarmerMonthlySales(farmerId);
        for (Object[] row : rawMonthly) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", row[0]);
            m.put("revenue", row[1]);
            monthlySales.add(m);
        }

        List<Map<String, Object>> topProducts = new ArrayList<>();
        List<Object[]> rawTop = orderRepository.getFarmerTopProducts(farmerId, PageRequest.of(0, 10));
        for (Object[] row : rawTop) {
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("productId", row[0]);
            p.put("productName", row[1]);
            p.put("imageUrl", row[2]);
            p.put("totalSold", row[3]);
            p.put("totalRevenue", row[4]);
            topProducts.add(p);
        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalRevenue", totalRevenue);
        data.put("todayRevenue", todayRevenue);
        data.put("monthRevenue", monthRevenue);
        data.put("monthlySales", monthlySales);
        data.put("topProducts", topProducts);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getMyProducts(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @ModelAttribute ProductSearchRequest searchRequest) {
        searchRequest.setSellerId(currentUser.getId());
        PagedResponse<ProductResponse> products = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PagedResponse<OrderResponse>>> getMyOrders(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @ModelAttribute OrderSearchRequest searchRequest) {
        PagedResponse<OrderResponse> orders = orderService.getFarmerOrders(currentUser.getId(), searchRequest);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PutMapping("/orders/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        if (!orderService.farmerOwnsOrder(currentUser.getId(), orderId)) {
            throw new BadRequestException("Order not found or does not contain your products");
        }
        OrderResponse order = orderService.updateOrderStatus(orderId, request);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", order));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(currentUser.getId())));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse profile = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profile));
    }

    @PutMapping("/profile/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed", null));
    }
}
