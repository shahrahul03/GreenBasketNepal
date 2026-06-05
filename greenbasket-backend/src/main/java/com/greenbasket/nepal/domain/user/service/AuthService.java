package com.greenbasket.nepal.domain.user.service;

import com.greenbasket.nepal.domain.user.dto.*;

public interface AuthService {

    JwtResponse register(SignUpRequest request);

    JwtResponse login(LoginRequest request);

    JwtResponse refreshToken(RefreshTokenRequest request);

    void logout(Long userId, String refreshToken);

    UserProfileResponse getCurrentUserProfile(Long userId);
}
