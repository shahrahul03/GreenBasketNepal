package com.greenbasket.nepal.domain.user.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.domain.user.dto.*;
import com.greenbasket.nepal.domain.user.service.AuthService;
import com.greenbasket.nepal.domain.user.service.GoogleAuthService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final GoogleAuthService googleAuthService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<JwtResponse>> register(
            @Valid @RequestBody SignUpRequest request) {
        log.debug("Registration request received: email={}, role={}, phone={}",
                request.getEmail(), request.getRole(), request.getPhone());
        JwtResponse response = authService.register(request);
        log.info("User registered successfully: {}", request.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        log.debug("Login request received: email={}", request.getEmail());
        JwtResponse response = authService.login(request);
        log.info("User logged in successfully: {}", request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<JwtResponse>> googleLogin(
            @Valid @RequestBody GoogleLoginRequest request) {
        log.debug("Google login request received");
        JwtResponse response = googleAuthService.authenticateWithGoogle(request);
        log.info("Google login successful");
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(
            @Valid @RequestBody RefreshTokenRequest request) {
        JwtResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @RequestBody(required = false) RefreshTokenRequest request) {
        String refreshToken = (request != null) ? request.getRefreshToken() : null;
        authService.logout(currentUser.getId(), refreshToken);
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        UserProfileResponse profile = authService.getCurrentUserProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }
}
