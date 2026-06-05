package com.greenbasket.nepal.domain.user.mapper;

import com.greenbasket.nepal.domain.user.dto.AdminUserResponse;
import com.greenbasket.nepal.domain.user.dto.UpdateProfileRequest;
import com.greenbasket.nepal.domain.user.dto.UserProfileResponse;
import com.greenbasket.nepal.domain.user.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserProfileResponse toProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName())
                .avatarUrl(user.getAvatarUrl())
                .isEmailVerified(user.isEmailVerified())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public AdminUserResponse toAdminResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName())
                .avatarUrl(user.getAvatarUrl())
                .isEmailVerified(user.isEmailVerified())
                .isActive(user.isActive())
                .isLocked(user.isLocked())
                .isSuspended(user.isSuspended())
                .approvalStatus(user.getApprovalStatus() != null ? user.getApprovalStatus().name() : "APPROVED")
                .failedLoginAttempts(user.getFailedLoginAttempts())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .suspendedAt(user.getSuspendedAt())
                .build();
    }

    public void updateEntity(UpdateProfileRequest request, User user) {
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
    }
}
