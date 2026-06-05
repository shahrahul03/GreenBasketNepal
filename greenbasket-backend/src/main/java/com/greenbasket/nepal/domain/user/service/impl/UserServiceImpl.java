package com.greenbasket.nepal.domain.user.service.impl;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.common.exception.UnauthorizedException;
import com.greenbasket.nepal.domain.order.dto.OrderResponse;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import com.greenbasket.nepal.domain.product.mapper.ProductMapper;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.dto.*;
import com.greenbasket.nepal.domain.user.entity.ApprovalStatus;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.mapper.UserMapper;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.domain.user.service.UserService;
import com.greenbasket.nepal.email.service.EmailService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = findActiveUserById(userId);
        return userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = findActiveUserById(userId);

        userMapper.updateEntity(request, user);
        user = userRepository.save(user);

        log.info("Profile updated for user: {}", user.getEmail());
        return userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = findActiveUserById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirmation do not match");
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void deactivateAccount(Long userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Password is incorrect");
        }

        user.setActive(false);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("Account deactivated for user: {}", user.getEmail());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminUserResponse> getUsers(UserSearchRequest searchRequest) {
        Specification<User> spec = buildSearchSpecification(searchRequest);

        Sort sort = Sort.by(searchRequest.getSortDirection(), searchRequest.getSortBy());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<AdminUserResponse> users = userPage.getContent()
                .stream()
                .map(userMapper::toAdminResponse)
                .toList();

        return PagedResponse.<AdminUserResponse>builder()
                .content(users)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return userMapper.toAdminResponse(user);
    }

    @Override
    @Transactional
    public void suspendUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.isSuspended()) {
            throw new BadRequestException("User is already suspended");
        }

        user.setSuspended(true);
        user.setSuspendedAt(LocalDateTime.now());
        user.setSuspendedBy(adminId);
        user.setActive(false);
        userRepository.save(user);

        log.info("User suspended: {} by admin: {}", user.getEmail(), adminId);
    }

    @Override
    @Transactional
    public void unsuspendUser(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.isSuspended()) {
            throw new BadRequestException("User is not currently suspended");
        }

        user.setSuspended(false);
        user.setSuspendedAt(null);
        user.setSuspendedBy(null);
        user.setActive(true);
        userRepository.save(user);

        log.info("User unsuspended: {} by admin: {}", user.getEmail(), adminId);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepository.save(user);

        log.info("User soft-deleted: {} (id: {})", user.getEmail(), userId);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AdminUserDetailResponse.AdminUserDetailResponseBuilder builder = AdminUserDetailResponse.builder()
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
                .deletedAt(user.getDeletedAt());

        String role = user.getRole().getName();

        if ("FARMER".equals(role)) {
            List<ProductResponse> products = productRepository.findBySellerId(userId)
                    .stream().map(productMapper::toResponse).toList();
            builder.products(products);
            builder.totalProducts(products.size());
        }

        return builder.build();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminUserResponse> getPendingFarmers(UserSearchRequest searchRequest) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isNull(root.get("deletedAt")));
            predicates.add(cb.equal(root.join("role").get("name"), "FARMER"));
            predicates.add(cb.equal(root.get("approvalStatus"), ApprovalStatus.PENDING));
            if (searchRequest.getSearch() != null && !searchRequest.getSearch().isBlank()) {
                String pattern = "%" + searchRequest.getSearch().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("fullName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern),
                    cb.like(root.get("phone"), pattern)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(searchRequest.getSortDirection(), searchRequest.getSortBy());
        Pageable pageable = PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);

        Page<User> userPage = userRepository.findAll(spec, pageable);

        List<AdminUserResponse> users = userPage.getContent()
                .stream()
                .map(userMapper::toAdminResponse)
                .toList();

        return PagedResponse.<AdminUserResponse>builder()
                .content(users)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .first(userPage.isFirst())
                .last(userPage.isLast())
                .build();
    }

    @Override
    @Transactional
    public void approveFarmer(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Farmer is not in PENDING status");
        }

        user.setApprovalStatus(ApprovalStatus.APPROVED);
        user.setActive(true);
        userRepository.save(user);

        log.info("Farmer approved: {} by admin: {}", user.getEmail(), adminId);
        emailService.sendFarmerApproved(user);
    }

    @Override
    @Transactional
    public void rejectFarmer(Long userId, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (user.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new BadRequestException("Farmer is not in PENDING status");
        }

        user.setApprovalStatus(ApprovalStatus.REJECTED);
        user.setActive(false);
        userRepository.save(user);

        log.info("Farmer rejected: {} by admin: {}", user.getEmail(), adminId);
        emailService.sendFarmerRejected(user);
    }

    private User findActiveUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.isActive() || user.isSuspended()) {
            throw new UnauthorizedException("Account is deactivated or suspended");
        }

        return user;
    }

    private Specification<User> buildSearchSpecification(UserSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNull(root.get("deletedAt")));

            if (request.getSearch() != null && !request.getSearch().isBlank()) {
                String pattern = "%" + request.getSearch().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("fullName")), pattern);
                Predicate emailLike = cb.like(cb.lower(root.get("email")), pattern);
                Predicate phoneLike = cb.like(root.get("phone"), pattern);
                predicates.add(cb.or(nameLike, emailLike, phoneLike));
            }

            if (request.getRole() != null && !request.getRole().isBlank()) {
                predicates.add(cb.equal(
                        cb.lower(root.join("role").get("name")),
                        request.getRole().toLowerCase()));
            }

            if (request.getIsActive() != null) {
                predicates.add(cb.equal(root.get("isActive"), request.getIsActive()));
            }

            if (request.getIsSuspended() != null) {
                predicates.add(cb.equal(root.get("isSuspended"), request.getIsSuspended()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
