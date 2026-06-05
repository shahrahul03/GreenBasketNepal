package com.greenbasket.nepal.domain.category.service;

import com.greenbasket.nepal.domain.category.dto.CategoryRequest;
import com.greenbasket.nepal.domain.category.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    CategoryResponse getCategoryById(Long id);

    CategoryResponse getCategoryBySlug(String slug);

    CategoryResponse createCategory(CategoryRequest request);

    CategoryResponse updateCategory(Long id, CategoryRequest request);

    void deleteCategory(Long id);

    void toggleCategoryStatus(Long id);
}
