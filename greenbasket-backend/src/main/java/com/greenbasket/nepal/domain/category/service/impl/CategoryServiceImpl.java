package com.greenbasket.nepal.domain.category.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.DuplicateResourceException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.category.dto.CategoryRequest;
import com.greenbasket.nepal.domain.category.dto.CategoryResponse;
import com.greenbasket.nepal.domain.category.entity.Category;
import com.greenbasket.nepal.domain.category.mapper.CategoryMapper;
import com.greenbasket.nepal.domain.category.repository.CategoryRepository;
import com.greenbasket.nepal.domain.category.service.CategoryService;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

        return categories.stream()
                .map(cat -> {
                    long count = productRepository.countByCategoryIdAndIsActiveTrue(cat.getId());
                    return categoryMapper.toResponse(cat, count);
                })
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        Category category = findActiveCategory(id);
        long count = productRepository.countByCategoryIdAndIsActiveTrue(category.getId());
        return categoryMapper.toResponse(category, count);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        long count = productRepository.countByCategoryIdAndIsActiveTrue(category.getId());
        return categoryMapper.toResponse(category, count);
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName().trim())) {
            throw new DuplicateResourceException(
                    "Category '" + request.getName() + "' already exists");
        }

        Category category = categoryMapper.toEntity(request);
        category = categoryRepository.save(category);

        log.info("Category created: {} (slug: {})", category.getName(), category.getSlug());
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        categoryMapper.updateEntity(request, category);
        category = categoryRepository.save(category);

        log.info("Category updated: {} (id: {})", category.getName(), category.getId());
        return categoryMapper.toResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            throw new BadRequestException(
                    "Cannot delete category with " + productCount + " associated products. " +
                    "Deactivate it instead.");
        }

        categoryRepository.delete(category);
        log.info("Category deleted: {} (id: {})", category.getName(), id);
    }

    @Override
    @Transactional
    public void toggleCategoryStatus(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        category.setActive(!category.isActive());
        categoryRepository.save(category);

        String status = category.isActive() ? "activated" : "deactivated";
        log.info("Category {}: {} (id: {})", status, category.getName(), id);
    }

    private Category findActiveCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        if (!category.isActive()) {
            throw new ResourceNotFoundException("Category", "id", id);
        }
        return category;
    }
}
