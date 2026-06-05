package com.greenbasket.nepal.domain.wishlist.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.domain.wishlist.dto.WishlistRequest;
import com.greenbasket.nepal.domain.wishlist.dto.WishlistResponse;
import com.greenbasket.nepal.domain.wishlist.service.WishlistService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistResponse>>> getWishlist(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        List<WishlistResponse> wishlist = wishlistService.getWishlist(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(wishlist));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<WishlistResponse>> addItem(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @Valid @RequestBody WishlistRequest request) {
        WishlistResponse item = wishlistService.addItem(currentUser.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Added to wishlist", item));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @PathVariable Long id) {
        wishlistService.removeItem(currentUser.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }

    @DeleteMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<Void>> removeByProduct(
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser,
            @PathVariable Long productId) {
        wishlistService.removeByProduct(currentUser.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success("Removed from wishlist", null));
    }
}
