package com.greenbasket.nepal.domain.user.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.DuplicateResourceException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private RoleRepository roleRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private JwtService jwtService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private EmailService emailService;

    private AuthService authService;

    private Role customerRole;
    private Role farmerRole;
    private User customer;
    private User farmer;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository, roleRepository, refreshTokenRepository,
                jwtService, passwordEncoder, emailService
        );

        customerRole = Role.builder().id(1L).name("CUSTOMER").build();
        farmerRole = Role.builder().id(2L).name("FARMER").build();

        customer = User.builder()
                .id(1L).email("test@test.com").fullName("Test User")
                .password("encoded").phone("9812345678")
                .role(customerRole).isActive(true).isEmailVerified(false)
                .isLocked(false).failedLoginAttempts(0)
                .approvalStatus(ApprovalStatus.APPROVED)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();

        farmer = User.builder()
                .id(2L).email("farmer@test.com").fullName("Test Farmer")
                .password("encoded").phone("9812345679")
                .role(farmerRole).isActive(true).isEmailVerified(false)
                .isLocked(false).failedLoginAttempts(0)
                .approvalStatus(ApprovalStatus.PENDING)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void register_shouldCreateUserAndReturnJwt() {
        SignUpRequest request = SignUpRequest.builder()
                .email("new@test.com").password("Password1").fullName("New User")
                .phone("9812345670").role("CUSTOMER").build();

        when(userRepository.existsByEmail("new@test.com")).thenReturn(false);
        when(roleRepository.findByName("CUSTOMER")).thenReturn(Optional.of(customerRole));
        when(passwordEncoder.encode("Password1")).thenReturn("encodedPassword1");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(5L);
            return u;
        });
        when(jwtService.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(anyLong())).thenReturn("refresh-token");

        JwtResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        verify(userRepository).save(any(User.class));
        verify(emailService).sendWelcomeEmail(any(User.class));
    }

    @Test
    void register_shouldThrowWhenEmailExists() {
        SignUpRequest request = SignUpRequest.builder()
                .email("existing@test.com").password("Password1").fullName("User")
                .phone("9812345670").role("CUSTOMER").build();

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_shouldThrowWhenRoleInvalid() {
        SignUpRequest request = SignUpRequest.builder()
                .email("test@test.com").password("Password1").fullName("User")
                .phone("9812345670").role("INVALID_ROLE").build();

        when(userRepository.existsByEmail("test@test.com")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void register_shouldSendAdminAlertForFarmer() {
        SignUpRequest request = SignUpRequest.builder()
                .email("farmer@test.com").password("Password1").fullName("New Farmer")
                .phone("9812345670").role("FARMER").build();

        when(userRepository.existsByEmail("farmer@test.com")).thenReturn(false);
        when(roleRepository.findByName("FARMER")).thenReturn(Optional.of(farmerRole));
        when(passwordEncoder.encode("Password1")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(6L);
            return u;
        });
        when(jwtService.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("tok");
        when(jwtService.generateRefreshToken(anyLong())).thenReturn("rtok");

        authService.register(request);

        verify(emailService).sendWelcomeEmail(any(User.class));
        verify(emailService).sendFarmerRegistrationAlert(any(User.class));
    }

    @Test
    void login_shouldReturnJwtWhenCredentialsValid() {
        LoginRequest request = new LoginRequest("test@test.com", "Password1");

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("Password1", "encoded")).thenReturn(true);
        when(jwtService.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(anyLong())).thenReturn("refresh-token");

        JwtResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
    }

    @Test
    void login_shouldThrowWhenEmailNotFound() {
        when(userRepository.findByEmail("nonexistent@test.com")).thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("nonexistent@test.com", "pass")));
    }

    @Test
    void login_shouldThrowWhenAccountDeactivated() {
        customer.setActive(false);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(customer));

        assertThrows(com.greenbasket.nepal.common.exception.UnauthorizedException.class,
                () -> authService.login(new LoginRequest("test@test.com", "Password1")));
    }

    @Test
    void login_shouldThrowWhenAccountLocked() {
        customer.setLocked(true);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(customer));

        assertThrows(com.greenbasket.nepal.common.exception.UnauthorizedException.class,
                () -> authService.login(new LoginRequest("test@test.com", "Password1")));
    }

    @Test
    void login_shouldLockAccountAfterFiveFailedAttempts() {
        customer.setFailedLoginAttempts(4);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(BadCredentialsException.class,
                () -> authService.login(new LoginRequest("test@test.com", "wrong")));

        assertTrue(customer.isLocked());
        assertEquals(5, customer.getFailedLoginAttempts());
        verify(userRepository).save(customer);
    }

    @Test
    void login_shouldResetFailedAttemptsOnSuccess() {
        customer.setFailedLoginAttempts(3);
        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(customer));
        when(passwordEncoder.matches("Password1", "encoded")).thenReturn(true);
        when(jwtService.generateAccessToken(anyLong(), anyString(), anyString())).thenReturn("tok");
        when(jwtService.generateRefreshToken(anyLong())).thenReturn("rtok");

        authService.login(new LoginRequest("test@test.com", "Password1"));

        assertEquals(0, customer.getFailedLoginAttempts());
    }

    @Test
    void getCurrentUserProfile_shouldReturnProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));

        UserProfileResponse profile = authService.getCurrentUserProfile(1L);

        assertNotNull(profile);
        assertEquals("test@test.com", profile.getEmail());
        assertEquals("Test User", profile.getFullName());
    }

    @Test
    void getCurrentUserProfile_shouldThrowWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> authService.getCurrentUserProfile(99L));
    }

    @Test
    void logout_shouldDeleteRefreshTokens() {
        authService.logout(1L, "some-token");
        verify(refreshTokenRepository).deleteByUserId(1L);
    }
}
