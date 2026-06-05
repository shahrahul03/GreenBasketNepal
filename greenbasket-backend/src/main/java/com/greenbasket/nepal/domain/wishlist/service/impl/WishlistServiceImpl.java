package com.greenbasket.nepal.domain.wishlist.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.DuplicateResourceException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.domain.wishlist.dto.WishlistRequest;
import com.greenbasket.nepal.domain.wishlist.dto.WishlistResponse;
import com.greenbasket.nepal.domain.wishlist.entity.Wishlist;
import com.greenbasket.nepal.domain.wishlist.repository.WishlistRepository;
import com.greenbasket.nepal.domain.wishlist.service.WishlistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public WishlistResponse addItem(Long userId, WishlistRequest request) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new DuplicateResourceException("Product is already in your wishlist");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (product.getDeletedAt() != null) {
            throw new BadRequestException("Product is no longer available");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Wishlist wishlist = Wishlist.builder()
                .user(user)
                .product(product)
                .notes(request.getNotes())
                .build();

        wishlist = wishlistRepository.save(wishlist);

        log.info("Wishlist item added. User: {}, Product: {}", userId, request.getProductId());

        return toResponse(wishlist);
    }

    @Override
    @Transactional
    public void removeItem(Long userId, Long wishlistId) {
        Wishlist wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Wishlist", "id", wishlistId));

        if (!wishlist.getUser().getId().equals(userId)) {
            throw new BadRequestException("Wishlist item does not belong to this user");
        }

        wishlistRepository.delete(wishlist);

        log.info("Wishlist item removed. User: {}, WishlistItem: {}", userId, wishlistId);
    }

    @Override
    @Transactional
    public void removeByProduct(Long userId, Long productId) {
        wishlistRepository.deleteByUserIdAndProductId(userId, productId);

        log.info("Wishlist item removed by product. User: {}, Product: {}", userId, productId);
    }

    private WishlistResponse toResponse(Wishlist wishlist) {
        Product product = wishlist.getProduct();

        return WishlistResponse.builder()
                .id(wishlist.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSlug(product.getSlug())
                .imageUrl(product.getImageUrl())
                .price(product.getPrice())
                .unit(product.getUnit())
                .isOrganic(product.isOrganic())
                .isAvailable(product.isAvailable() && product.isActive()
                        && product.getDeletedAt() == null)
                .categoryName(product.getCategory().getName())
                .notes(wishlist.getNotes())
                .createdAt(wishlist.getCreatedAt())
                .build();
    }
}
