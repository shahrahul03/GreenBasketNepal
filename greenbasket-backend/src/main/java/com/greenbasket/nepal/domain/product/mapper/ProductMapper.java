package com.greenbasket.nepal.domain.product.mapper;

import com.greenbasket.nepal.domain.product.dto.ProductImageResponse;
import com.greenbasket.nepal.domain.product.dto.ProductRequest;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.entity.ProductImage;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class ProductMapper {

    public ProductResponse toResponse(Product product) {
        List<ProductImageResponse> imageResponses = Optional.ofNullable(product.getImages())
                .orElse(Collections.emptyList())
                .stream()
                .map(this::toImageResponse)
                .toList();

        String primaryImage = product.getImageUrl();
        if (primaryImage == null || primaryImage.isBlank()) {
            primaryImage = imageResponses.stream()
                    .filter(ProductImageResponse::isPrimary)
                    .findFirst()
                    .map(ProductImageResponse::getImageUrl)
                    .orElse(null);
        }

        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .summary(product.getSummary())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .unit(product.getUnit())
                .isOrganic(product.isOrganic())
                .isAvailable(product.isAvailable())
                .isFeatured(product.isFeatured())
                .soldCount(product.getSoldCount())
                .imageUrl(primaryImage)
                .images(imageResponses)
                .category(ProductResponse.CategoryInfo.builder()
                        .id(product.getCategory().getId())
                        .name(product.getCategory().getName())
                        .slug(product.getCategory().getSlug())
                        .build())
                .seller(ProductResponse.SellerInfo.builder()
                        .id(product.getSeller().getId())
                        .fullName(product.getSeller().getFullName())
                        .email(product.getSeller().getEmail())
                        .phone(product.getSeller().getPhone())
                        .build())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    public ProductImageResponse toImageResponse(ProductImage image) {
        return ProductImageResponse.builder()
                .id(image.getId())
                .imageUrl(image.getImageUrl())
                .isPrimary(image.isPrimary())
                .sortOrder(image.getSortOrder())
                .build();
    }

    public String generateSlug(String name) {
        String base = name.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
        if (base.endsWith("-")) {
            base = base.substring(0, base.length() - 1);
        }
        return base + "-" + System.currentTimeMillis();
    }
}
