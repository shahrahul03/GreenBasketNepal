package com.greenbasket.nepal.domain.user.service;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.user.dto.*;

public interface UserService {

    UserProfileResponse getProfile(Long userId);

    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);

    void changePassword(Long userId, ChangePasswordRequest request);

    void deactivateAccount(Long userId, String password);

    PagedResponse<AdminUserResponse> getUsers(UserSearchRequest searchRequest);

    AdminUserResponse getUserById(Long userId);

    void suspendUser(Long userId, Long adminId);

    void unsuspendUser(Long userId, Long adminId);

    void deleteUser(Long userId);

    AdminUserDetailResponse getUserDetail(Long userId);

    PagedResponse<AdminUserResponse> getPendingFarmers(UserSearchRequest searchRequest);

    void approveFarmer(Long userId, Long adminId);

    void rejectFarmer(Long userId, Long adminId);
}
