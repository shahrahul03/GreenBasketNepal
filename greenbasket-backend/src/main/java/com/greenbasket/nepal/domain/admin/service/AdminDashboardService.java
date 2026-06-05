package com.greenbasket.nepal.domain.admin.service;

import com.greenbasket.nepal.domain.admin.dto.DashboardStatsResponse;

import java.util.List;

public interface AdminDashboardService {

    DashboardStatsResponse getDashboardStats();

    List<DashboardStatsResponse.RecentActivity> getRecentActivity();
}
