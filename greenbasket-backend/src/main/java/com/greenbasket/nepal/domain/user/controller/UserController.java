package com.greenbasket.nepal.domain.user.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.user.dto.AdminUserDetailResponse;
import com.greenbasket.nepal.domain.user.dto.AdminUserResponse;
import com.greenbasket.nepal.domain.user.dto.ChangePasswordRequest;
import com.greenbasket.nepal.domain.user.dto.DeactivateAccountRequest;
import com.greenbasket.nepal.domain.user.dto.UpdateProfileRequest;
import com.greenbasket.nepal.domain.user.dto.UserProfileResponse;
import com.greenbasket.nepal.domain.user.dto.UserSearchRequest;
import com.greenbasket.nepal.domain.user.service.UserService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ──────────────────────────────────────────────
    //  Self-service endpoints — /api/v1/users/**
    // ──────────────────────────────────────────────

    @GetMapping("/api/v1/users/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getProfile(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        UserProfileResponse profile = userService.getProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/api/v1/users/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody UpdateProfileRequest request) {
        UserProfileResponse profile = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @PutMapping("/api/v1/users/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    @DeleteMapping("/api/v1/users/me")
    public ResponseEntity<ApiResponse<Void>> deactivateAccount(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody DeactivateAccountRequest request) {
        userService.deactivateAccount(currentUser.getId(), request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Account deactivated successfully", null));
    }

    // ──────────────────────────────────────────────
    //  Admin endpoints — /api/v1/admin/users/**
    // ──────────────────────────────────────────────

    @GetMapping("/api/v1/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserResponse>>> getUsers(
            @ModelAttribute UserSearchRequest searchRequest) {
        PagedResponse<AdminUserResponse> users = userService.getUsers(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/api/v1/admin/users/delivery-partners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserResponse>>> getDeliveryPartners() {
        UserSearchRequest searchRequest = UserSearchRequest.builder()
                .role("DELIVERY_PARTNER")
                .page(0)
                .size(200)
                .build();
        PagedResponse<AdminUserResponse> users = userService.getUsers(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/api/v1/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUserById(
            @PathVariable Long id) {
        AdminUserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PatchMapping("/api/v1/admin/users/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> suspendUser(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails admin) {
        userService.suspendUser(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("User suspended successfully", null));
    }

    @PatchMapping("/api/v1/admin/users/{id}/unsuspend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> unsuspendUser(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails admin) {
        userService.unsuspendUser(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("User unsuspended successfully", null));
    }

    @DeleteMapping("/api/v1/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @GetMapping("/api/v1/admin/users/{id}/details")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>> getUserDetail(@PathVariable Long id) {
        AdminUserDetailResponse detail = userService.getUserDetail(id);
        return ResponseEntity.ok(ApiResponse.success(detail));
    }

    @GetMapping("/api/v1/admin/farmers/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AdminUserResponse>>> getPendingFarmers(
            @ModelAttribute UserSearchRequest searchRequest) {
        PagedResponse<AdminUserResponse> farmers = userService.getPendingFarmers(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(farmers));
    }

    @PostMapping("/api/v1/admin/farmers/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approveFarmer(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails admin) {
        userService.approveFarmer(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("Farmer approved successfully", null));
    }

    @PostMapping("/api/v1/admin/farmers/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectFarmer(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails admin) {
        userService.rejectFarmer(id, admin.getId());
        return ResponseEntity.ok(ApiResponse.success("Farmer rejected successfully", null));
    }
}
