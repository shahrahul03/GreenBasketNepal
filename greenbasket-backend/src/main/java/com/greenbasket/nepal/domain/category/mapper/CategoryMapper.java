package com.greenbasket.nepal.domain.category.mapper;

import com.greenbasket.nepal.domain.category.dto.CategoryRequest;
import com.greenbasket.nepal.domain.category.dto.CategoryResponse;
import com.greenbasket.nepal.domain.category.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(Category category) {
        return toResponse(category, 0);
    }

    public CategoryResponse toResponse(Category category, long productCount) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.isActive())
                .productCount(productCount)
                .createdAt(category.getCreatedAt())
                .build();
    }

    public Category toEntity(CategoryRequest request) {
        return Category.builder()
                .name(request.getName().trim())
                .slug(generateSlug(request.getName()))
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
    }

    public void updateEntity(CategoryRequest request, Category category) {
        if (request.getName() != null) {
            category.setName(request.getName().trim());
            category.setSlug(generateSlug(request.getName()));
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
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
