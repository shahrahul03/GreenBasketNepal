package com.greenbasket.nepal.domain.wishlist.service;

import com.greenbasket.nepal.domain.wishlist.dto.WishlistRequest;
import com.greenbasket.nepal.domain.wishlist.dto.WishlistResponse;

import java.util.List;

public interface WishlistService {

    List<WishlistResponse> getWishlist(Long userId);

    WishlistResponse addItem(Long userId, WishlistRequest request);

    void removeItem(Long userId, Long wishlistId);

    void removeByProduct(Long userId, Long productId);
}
