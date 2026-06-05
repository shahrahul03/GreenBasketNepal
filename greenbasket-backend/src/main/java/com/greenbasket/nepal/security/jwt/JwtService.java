package com.greenbasket.nepal.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Component
public class JwtService {

    private final SecretKey accessTokenSecret;
    private final long accessTokenExpiration;
    private final SecretKey refreshTokenSecret;
    private final long refreshTokenExpiration;

    public JwtService(
            @Value("${app.jwt.access-token-secret}") String accessTokenSecret,
            @Value("${app.jwt.access-token-expiration}") long accessTokenExpiration,
            @Value("${app.jwt.refresh-token-secret}") String refreshTokenSecret,
            @Value("${app.jwt.refresh-token-expiration}") long refreshTokenExpiration) {
        this.accessTokenSecret = Keys.hmacShaKeyFor(Decoders.BASE64.decode(accessTokenSecret));
        this.accessTokenExpiration = accessTokenExpiration;
        this.refreshTokenSecret = Keys.hmacShaKeyFor(Decoders.BASE64.decode(refreshTokenSecret));
        this.refreshTokenExpiration = refreshTokenExpiration;
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
