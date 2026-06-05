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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private ProductRepository productRepository;
    @Mock private CategoryMapper categoryMapper;

    private CategoryService categoryService;
    private Category category;

    @BeforeEach
    void setUp() {
        categoryService = new CategoryServiceImpl(categoryRepository, productRepository, categoryMapper);

        category = Category.builder()
                .id(1L).name("Vegetables").slug("vegetables")
                .description("Fresh vegetables").isActive(true)
                .build();
    }

    @Test
    void getAllCategories_shouldReturn() {
        when(categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()).thenReturn(List.of(category));
        when(productRepository.countByCategoryIdAndIsActiveTrue(1L)).thenReturn(0L);
        when(categoryMapper.toResponse(category, 0L)).thenReturn(
                CategoryResponse.builder().id(1L).name("Vegetables").slug("vegetables").build()
        );

        List<CategoryResponse> result = categoryService.getAllCategories();

        assertEquals(1, result.size());
        assertEquals("Vegetables", result.get(0).getName());
    }

    @Test
    void getCategoryById_shouldReturn() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.countByCategoryIdAndIsActiveTrue(1L)).thenReturn(0L);
        when(categoryMapper.toResponse(category, 0L)).thenReturn(
                CategoryResponse.builder().id(1L).name("Vegetables").slug("vegetables").build()
        );

        CategoryResponse result = categoryService.getCategoryById(1L);

        assertEquals("Vegetables", result.getName());
    }

    @Test
    void getCategoryById_shouldThrowWhenNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> categoryService.getCategoryById(99L));
    }

    @Test
    void getCategoryBySlug_shouldReturn() {
        when(categoryRepository.findBySlug("vegetables")).thenReturn(Optional.of(category));
        when(productRepository.countByCategoryIdAndIsActiveTrue(1L)).thenReturn(0L);
        when(categoryMapper.toResponse(category, 0L)).thenReturn(
                CategoryResponse.builder().id(1L).name("Vegetables").slug("vegetables").build()
        );

        CategoryResponse result = categoryService.getCategoryBySlug("vegetables");

        assertNotNull(result);
    }

    @Test
    void getCategoryBySlug_shouldThrowWhenNotFound() {
        when(categoryRepository.findBySlug("nonexistent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> categoryService.getCategoryBySlug("nonexistent"));
    }

    @Test
    void createCategory_shouldCreate() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Fruits");
        request.setDescription("Fresh fruits");

        when(categoryRepository.existsByName("Fruits")).thenReturn(false);
        when(categoryMapper.toEntity(request)).thenReturn(
                Category.builder().name("Fruits").slug("fruits-" + System.currentTimeMillis()).build()
        );
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(2L);
            return c;
        });
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(
                CategoryResponse.builder().id(2L).name("Fruits").build()
        );

        CategoryResponse result = categoryService.createCategory(request);

        assertEquals("Fruits", result.getName());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategory_shouldThrowWhenNameExists() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Fruits");

        when(categoryRepository.existsByName("Fruits")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> categoryService.createCategory(request));
    }

    @Test
    void updateCategory_shouldUpdate() {
        CategoryRequest request = new CategoryRequest();
        request.setName("Updated Vegetables");
        request.setDescription("Updated");

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenReturn(category);
        when(categoryMapper.toResponse(any(Category.class))).thenReturn(
                CategoryResponse.builder().id(1L).name("Updated Vegetables").build()
        );

        CategoryResponse result = categoryService.updateCategory(1L, request);

        assertEquals("Updated Vegetables", result.getName());
    }

    @Test
    void toggleCategoryStatus_shouldToggle() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        categoryService.toggleCategoryStatus(1L);

        assertFalse(category.isActive());

        categoryService.toggleCategoryStatus(1L);

        assertTrue(category.isActive());
    }

    @Test
    void deleteCategory_shouldDelete() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.countByCategoryId(1L)).thenReturn(0L);

        categoryService.deleteCategory(1L);

        verify(categoryRepository).delete(category);
    }

    @Test
    void deleteCategory_shouldThrowWhenHasProducts() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.countByCategoryId(1L)).thenReturn(3L);

        assertThrows(BadRequestException.class, () -> categoryService.deleteCategory(1L));
    }

    @Test
    void deleteCategory_shouldThrowWhenNotFound() {
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> categoryService.deleteCategory(99L));
    }
}
