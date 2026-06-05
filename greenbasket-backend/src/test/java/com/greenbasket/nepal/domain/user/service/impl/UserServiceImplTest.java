package com.greenbasket.nepal.domain.user.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.user.dto.*;
import com.greenbasket.nepal.domain.user.entity.ApprovalStatus;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.mapper.UserMapper;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.domain.user.service.UserService;
import com.greenbasket.nepal.email.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private com.greenbasket.nepal.domain.order.repository.OrderRepository orderRepository;
    @Mock private com.greenbasket.nepal.domain.product.repository.ProductRepository productRepository;
    @Mock private com.greenbasket.nepal.domain.product.mapper.ProductMapper productMapper;
    @Mock private EmailService emailService;

    private UserService userService;
    private User activeUser;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(
                userRepository, userMapper, passwordEncoder,
                orderRepository, productRepository, productMapper, emailService
        );

        activeUser = User.builder()
                .id(1L).email("user@test.com").fullName("Test User")
                .password("encoded").phone("9812345678")
                .isActive(true).isSuspended(false).isLocked(false)
                .failedLoginAttempts(0)
                .approvalStatus(ApprovalStatus.APPROVED)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void updateProfile_shouldUpdateAndReturn() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setFullName("Updated Name");
        request.setPhone("9812345679");

        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(userRepository.save(any(User.class))).thenReturn(activeUser);
        when(userMapper.toProfileResponse(any(User.class))).thenReturn(
                UserProfileResponse.builder().fullName("Updated Name").build()
        );

        UserProfileResponse result = userService.updateProfile(1L, request);

        assertEquals("Updated Name", result.getFullName());
        verify(userRepository).save(activeUser);
    }

    @Test
    void changePassword_shouldSucceedWhenCurrentPasswordMatches() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPass");
        request.setNewPassword("NewPass123");
        request.setConfirmPassword("NewPass123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("oldPass", "encoded")).thenReturn(true);
        when(passwordEncoder.encode("NewPass123")).thenReturn("newEncoded");

        userService.changePassword(1L, request);

        verify(userRepository).save(activeUser);
        assertEquals("newEncoded", activeUser.getPassword());
    }

    @Test
    void changePassword_shouldThrowWhenCurrentPasswordWrong() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("wrong");
        request.setNewPassword("NewPass123");
        request.setConfirmPassword("NewPass123");

        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.changePassword(1L, request));
    }

    @Test
    void changePassword_shouldThrowWhenPasswordsDontMatch() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPass");
        request.setNewPassword("NewPass123");
        request.setConfirmPassword("Different");

        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("oldPass", "encoded")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.changePassword(1L, request));
    }

    @Test
    void changePassword_shouldThrowWhenNewPasswordSameAsCurrent() {
        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setCurrentPassword("oldPass");
        request.setNewPassword("oldPass");
        request.setConfirmPassword("oldPass");

        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("oldPass", "encoded")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> userService.changePassword(1L, request));
    }

    @Test
    void deactivateAccount_shouldDeactivate() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("pass", "encoded")).thenReturn(true);

        userService.deactivateAccount(1L, "pass");

        assertFalse(activeUser.isActive());
        assertNotNull(activeUser.getDeletedAt());
    }

    @Test
    void deactivateAccount_shouldThrowWhenPasswordWrong() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThrows(BadRequestException.class, () -> userService.deactivateAccount(1L, "wrong"));
    }

    @Test
    void approveFarmer_shouldApprove() {
        User farmer = User.builder().id(2L).approvalStatus(ApprovalStatus.PENDING).build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(farmer));

        userService.approveFarmer(2L, 1L);

        assertEquals(ApprovalStatus.APPROVED, farmer.getApprovalStatus());
        assertTrue(farmer.isActive());
        verify(emailService).sendFarmerApproved(farmer);
    }

    @Test
    void approveFarmer_shouldThrowWhenNotPending() {
        User farmer = User.builder().id(2L).approvalStatus(ApprovalStatus.APPROVED).build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(farmer));

        assertThrows(BadRequestException.class, () -> userService.approveFarmer(2L, 1L));
    }

    @Test
    void rejectFarmer_shouldReject() {
        User farmer = User.builder().id(2L).approvalStatus(ApprovalStatus.PENDING).isActive(true).build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(farmer));

        userService.rejectFarmer(2L, 1L);

        assertEquals(ApprovalStatus.REJECTED, farmer.getApprovalStatus());
        assertFalse(farmer.isActive());
        verify(emailService).sendFarmerRejected(farmer);
    }

    @Test
    void suspendUser_shouldSuspend() {
        User target = User.builder().id(2L).isSuspended(false).isActive(true).build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        userService.suspendUser(2L, 1L);

        assertTrue(target.isSuspended());
        assertFalse(target.isActive());
        assertNotNull(target.getSuspendedAt());
        assertEquals(1L, target.getSuspendedBy());
    }

    @Test
    void suspendUser_shouldThrowWhenAlreadySuspended() {
        User target = User.builder().id(2L).isSuspended(true).build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        assertThrows(BadRequestException.class, () -> userService.suspendUser(2L, 1L));
    }

    @Test
    void unsuspendUser_shouldRestore() {
        User target = User.builder().id(2L).isSuspended(true).suspendedAt(LocalDateTime.now()).suspendedBy(1L).isActive(false).build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        userService.unsuspendUser(2L, 1L);

        assertFalse(target.isSuspended());
        assertTrue(target.isActive());
        assertNull(target.getSuspendedAt());
        assertNull(target.getSuspendedBy());
    }

    @Test
    void unsuspendUser_shouldThrowWhenNotSuspended() {
        User target = User.builder().id(2L).isSuspended(false).build();
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));

        assertThrows(BadRequestException.class, () -> userService.unsuspendUser(2L, 1L));
    }

    @Test
    void deleteUser_shouldSoftDelete() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));

        userService.deleteUser(1L);

        assertFalse(activeUser.isActive());
        assertNotNull(activeUser.getDeletedAt());
    }

    @Test
    void getProfile_shouldReturnProfile() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));
        when(userMapper.toProfileResponse(activeUser)).thenReturn(
                UserProfileResponse.builder().fullName("Test User").build()
        );

        UserProfileResponse result = userService.getProfile(1L);

        assertNotNull(result);
        assertEquals("Test User", result.getFullName());
    }

    @Test
    void getProfile_shouldThrowWhenNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getProfile(99L));
    }

    @Test
    void getProfile_shouldThrowWhenDeactivated() {
        activeUser.setActive(false);
        activeUser.setDeletedAt(LocalDateTime.now());
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));

        assertThrows(com.greenbasket.nepal.common.exception.UnauthorizedException.class,
                () -> userService.getProfile(1L));
    }

    @Test
    void getProfile_shouldThrowWhenSuspended() {
        activeUser.setSuspended(true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(activeUser));

        assertThrows(com.greenbasket.nepal.common.exception.UnauthorizedException.class,
                () -> userService.getProfile(1L));
    }
}
