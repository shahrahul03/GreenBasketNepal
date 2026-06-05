package com.greenbasket.nepal.domain.user;

import com.greenbasket.nepal.domain.user.entity.ApprovalStatus;
import com.greenbasket.nepal.domain.user.entity.Role;
import com.greenbasket.nepal.domain.user.entity.User;

import java.time.LocalDateTime;

public final class TestDataFactory {

    public static Role createRole(String name) {
        return Role.builder()
                .id(1L)
                .name(name)
                .description(name + " role")
                .isSystem(true)
                .build();
    }

    public static User createUser(Long id, String email, String roleName) {
        return User.builder()
                .id(id)
                .email(email)
                .fullName("Test User")
                .password("encodedPassword123")
                .phone("9812345678")
                .role(createRole(roleName))
                .isActive(true)
                .isEmailVerified(false)
                .isLocked(false)
                .isSuspended(false)
                .failedLoginAttempts(0)
                .approvalStatus("FARMER".equals(roleName) ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED)
                .provider("LOCAL")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    public static User createCustomer() {
        return createUser(1L, "customer@test.com", "CUSTOMER");
    }

    public static User createFarmer() {
        return createUser(2L, "farmer@test.com", "FARMER");
    }

    public static User createAdmin() {
        return createUser(3L, "admin@test.com", "ADMIN");
    }

    public static User createDeliveryPartner() {
        return createUser(4L, "partner@test.com", "DELIVERY_PARTNER");
    }

    private TestDataFactory() {}
}
