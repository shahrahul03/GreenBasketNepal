package com.greenbasket.nepal.domain.admin.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.domain.admin.dto.DashboardStatsResponse;
import com.greenbasket.nepal.domain.admin.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = adminDashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/recent-activity")
    public ResponseEntity<ApiResponse<List<DashboardStatsResponse.RecentActivity>>> getRecentActivity() {
        List<DashboardStatsResponse.RecentActivity> activities = adminDashboardService.getRecentActivity();
        return ResponseEntity.ok(ApiResponse.success(activities));
    }
}
