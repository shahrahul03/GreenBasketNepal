package com.greenbasket.nepal.domain.user.service;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.domain.user.dto.GoogleLoginRequest;
import com.greenbasket.nepal.domain.user.dto.JwtResponse;
import com.greenbasket.nepal.domain.user.entity.RefreshToken;
import com.greenbasket.nepal.domain.user.entity.Role;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.RefreshTokenRepository;
import com.greenbasket.nepal.domain.user.repository.RoleRepository;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.email.service.EmailService;
import com.greenbasket.nepal.security.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;
    private final EmailService emailService;

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Value("${app.jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Transactional
    public JwtResponse authenticateWithGoogle(GoogleLoginRequest request) {
        Map<String, Object> payload = verifyGoogleToken(request.getCredential());

        String email = ((String) payload.get("email")).trim().toLowerCase();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");
        String googleSub = (String) payload.get("sub");

        log.debug("Google login attempt: email={}, name={}", email, name);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user != null) {
            user.setProvider("GOOGLE");
            user.setProviderId(googleSub);
            if (picture != null) {
                user.setAvatarUrl(picture);
            }
            user.setFailedLoginAttempts(0);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            log.info("Existing user logged in via Google: {}", email);
            return generateJwtResponse(user);
        }

        Role role = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> {
                    log.error("CUSTOMER role not found in database");
                    return new RuntimeException("CUSTOMER role not found");
                });

        User newUser = User.builder()
                .fullName(name != null ? name.trim() : email.split("@")[0])
                .email(email)
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .role(role)
                .avatarUrl(picture)
                .provider("GOOGLE")
                .providerId(googleSub)
                .isActive(true)
                .isEmailVerified(true)
                .isLocked(false)
                .isSuspended(false)
                .failedLoginAttempts(0)
                .build();

        newUser = userRepository.save(newUser);
        log.info("New customer created via Google: {}", email);
        emailService.sendWelcomeEmail(newUser);
        return generateJwtResponse(newUser);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> verifyGoogleToken(String credential) {
        String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;

        try {
            Map<String, Object> payload = restTemplate.getForObject(url, Map.class);

            if (payload == null) {
                throw new BadRequestException("Invalid Google token: empty response");
            }

            String aud = (String) payload.get("aud");
            if (!googleClientId.equals(aud)) {
                log.warn("Google token audience mismatch. Expected: {}, Actual: {}", googleClientId, aud);
                throw new BadRequestException("Invalid Google token: audience mismatch");
            }

            String issuer = (String) payload.get("iss");
            if (issuer == null || (!issuer.equals("accounts.google.com") && !issuer.equals("https://accounts.google.com"))) {
                throw new BadRequestException("Invalid Google token: invalid issuer");
            }

            if (payload.get("email") == null) {
                throw new BadRequestException("Google account has no email");
            }

            return payload;
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw new BadRequestException("Google token verification failed");
        }
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
}
