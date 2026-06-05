package com.greenbasket.nepal.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtService {

    private static final int HMAC_MIN_BITS = 256;
    private static final int HMAC_MIN_BYTES = HMAC_MIN_BITS / 8;

    private final String rawAccessTokenSecret;
    private final long accessTokenExpiration;
    private final String rawRefreshTokenSecret;
    private final long refreshTokenExpiration;

    private SecretKey accessTokenSecret;
    private SecretKey refreshTokenSecret;

    public JwtService(
            @Value("${app.jwt.access-token-secret}") String accessTokenSecret,
            @Value("${app.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-token-secret}") String refreshTokenSecret,
            @Value("${app.jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.rawAccessTokenSecret = accessTokenSecret;
        this.accessTokenExpiration = accessTokenExpiration;
        this.rawRefreshTokenSecret = refreshTokenSecret;
        this.refreshTokenExpiration = refreshTokenExpiration;
    }

    @PostConstruct
    public void init() {
        this.accessTokenSecret = validateAndDecode(
                rawAccessTokenSecret, "JWT_ACCESS_SECRET");
        this.refreshTokenSecret = validateAndDecode(
                rawRefreshTokenSecret, "JWT_REFRESH_SECRET");
        log.info("JWT secrets validated successfully");
    }

    private SecretKey validateAndDecode(String secret, String propertyName) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException(
                    propertyName + " is missing or empty. Set it as an environment variable " +
                    "or in application.yml for local development.");
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    propertyName + " is not a valid Base64-encoded string.", e);
        }

        if (keyBytes.length < HMAC_MIN_BYTES) {
            int actualBits = keyBytes.length * 8;
            throw new IllegalArgumentException(
                    propertyName + " is too short: " + actualBits + " bits. " +
                    "Minimum required: " + HMAC_MIN_BITS + " bits (" + HMAC_MIN_BYTES + " bytes). " +
                    "Generate a proper key with: openssl rand -base64 32");
        }

        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(Long userId, String email, String roleName) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("email", email)
                .claim("role", roleName)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(accessTokenSecret)
                .compact();
    }

    public String generateRefreshToken(Long userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .subject(userId.toString())
                .claim("type", "refresh")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(refreshTokenSecret)
                .compact();
    }

    public Long getUserIdFromAccessToken(String token) {
        Claims claims = parseAccessToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public Long getUserIdFromRefreshToken(String token) {
        Claims claims = parseRefreshToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public boolean validateAccessToken(String token) {
        try {
            parseAccessToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid access token: {}", e.getMessage());
            return false;
        }
    }

    public boolean validateRefreshToken(String token) {
        try {
            parseRefreshToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Invalid refresh token: {}", e.getMessage());
            return false;
        }
    }

    private Claims parseAccessToken(String token) {
        return Jwts.parser()
                .verifyWith(accessTokenSecret)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Claims parseRefreshToken(String token) {
        return Jwts.parser()
                .verifyWith(refreshTokenSecret)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
