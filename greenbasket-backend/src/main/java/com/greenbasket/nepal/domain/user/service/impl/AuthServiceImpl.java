package com.greenbasket.nepal.domain.user.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.DuplicateResourceException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.common.exception.UnauthorizedException;
import com.greenbasket.nepal.domain.user.dto.*;
import com.greenbasket.nepal.domain.user.entity.ApprovalStatus;
import com.greenbasket.nepal.domain.user.entity.RefreshToken;
import com.greenbasket.nepal.domain.user.entity.Role;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.RefreshTokenRepository;
import com.greenbasket.nepal.domain.user.repository.RoleRepository;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.domain.user.service.AuthService;
import com.greenbasket.nepal.email.service.EmailService;
import com.greenbasket.nepal.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Set<String> ALLOWED_ROLES = Set.of("CUSTOMER", "FARMER", "DELIVERY_PARTNER");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Override
    @Transactional
    public JwtResponse register(SignUpRequest request) {
        log.debug("Processing registration: email={}, role={}, phone={}, fullName={}",
                request.getEmail(), request.getRole(), request.getPhone(), request.getFullName());

        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Registration failed: email already exists: {}", request.getEmail());
            throw new DuplicateResourceException(
                    "Email '" + request.getEmail() + "' is already registered");
        }

        String roleName = request.getRole().toUpperCase();
        if (!ALLOWED_ROLES.contains(roleName)) {
            log.warn("Registration failed: invalid role '{}'. Allowed: {}", roleName, ALLOWED_ROLES);
            throw new BadRequestException(
                    "Role '" + request.getRole() + "' is not allowed for self-registration. "
                    + "Please select " + String.join(" or ", ALLOWED_ROLES));
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> {
                    log.error("Role '{}' not found in database", roleName);
                    return new ResourceNotFoundException("Role not found: " + roleName);
                });

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .isActive(true)
                .isEmailVerified(false)
                .isLocked(false)
                .failedLoginAttempts(0)
                .approvalStatus(requiresApproval(roleName) ? ApprovalStatus.PENDING : ApprovalStatus.APPROVED)
                .build();

        user = userRepository.save(user);

        log.info("User registered successfully: {} with role {}", user.getEmail(), role.getName());

        emailService.sendWelcomeEmail(user);
        if ("FARMER".equals(roleName)) {
            emailService.sendFarmerRegistrationAlert(user);
        }

        return generateJwtResponse(user);
    }

    @Override
    @Transactional
    public JwtResponse login(LoginRequest request) {
        log.debug("Login attempt for email: {}", request.getEmail());
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> {
                    log.warn("Login failed: no user found for email: {}", request.getEmail());
                    return new BadCredentialsException("Invalid email or password");
                });

        if (!user.isActive()) {
            throw new UnauthorizedException("Account is deactivated. Contact support.");
        }

        if (user.isLocked()) {
            throw new UnauthorizedException("Account is locked due to multiple failed attempts. Reset your password.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);

            if (user.getFailedLoginAttempts() >= 5) {
                user.setLocked(true);
                log.warn("Account locked due to 5 failed attempts: {}", user.getEmail());
            }

            userRepository.save(user);
            throw new BadCredentialsException("Invalid email or password");
        }

        user.setFailedLoginAttempts(0);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User logged in successfully: {}", user.getEmail());

        return generateJwtResponse(user);
    }

    @Override
    @Transactional
    public JwtResponse refreshToken(RefreshTokenRequest request) {
        if (!jwtService.validateRefreshToken(request.getRefreshToken())) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        Long userId = jwtService.getUserIdFromRefreshToken(request.getRefreshToken());

        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Refresh token not found"));

        if (!storedToken.isValid()) {
            refreshTokenRepository.delete(storedToken);
            throw new BadRequestException("Refresh token has been revoked or expired. Please login again.");
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return generateJwtResponse(user);
    }

    @Override
    @Transactional
    public void logout(Long userId, String refreshToken) {
        refreshTokenRepository.deleteByUserId(userId);
        log.info("User logged out: {}", userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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

    private JwtResponse generateJwtResponse(User user) {
        String accessToken = jwtService.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole().getName());

        String refreshToken = jwtService.generateRefreshToken(user.getId());

        saveRefreshToken(user, refreshToken);

        JwtResponse.UserInfo userInfo = JwtResponse.UserInfo.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName())
                .avatarUrl(user.getAvatarUrl())
                .build();

        return JwtResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessTokenExpiration)
                .user(userInfo)
                .build();
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(token)
                .isRevoked(false)
                .expiresAt(LocalDateTime.now().plusSeconds(604800))
                .build();

        refreshTokenRepository.save(refreshToken);
    }

    private boolean requiresApproval(String roleName) {
        return "FARMER".equals(roleName) || "DELIVERY_PARTNER".equals(roleName);
    }
}
