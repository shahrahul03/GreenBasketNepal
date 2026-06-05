package com.greenbasket.nepal.domain.product.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.category.entity.Category;
import com.greenbasket.nepal.domain.category.repository.CategoryRepository;
import com.greenbasket.nepal.domain.product.dto.ProductRequest;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.mapper.ProductMapper;
import com.greenbasket.nepal.domain.product.repository.ProductImageRepository;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.product.service.ProductService;
import com.greenbasket.nepal.domain.user.entity.ApprovalStatus;
import com.greenbasket.nepal.domain.user.entity.Role;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock private ProductRepository productRepository;
    @Mock private CategoryRepository categoryRepository;
    @Mock private ProductImageRepository productImageRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProductMapper productMapper;

    private ProductService productService;
    private Product product;
    private Category category;
    private User seller;

    @BeforeEach
    void setUp() {
        productService = new ProductServiceImpl(
                productRepository, productImageRepository, categoryRepository,
                userRepository, productMapper
        );

        category = Category.builder().id(1L).name("Vegetables").slug("vegetables").build();

        seller = User.builder().id(1L).fullName("Seller")
                .role(Role.builder().id(2L).name("FARMER").build())
                .approvalStatus(ApprovalStatus.APPROVED)
                .build();

        product = Product.builder()
                .id(1L).name("Test Product").slug("test-product")
                .description("A test product")
                .price(new BigDecimal("100")).unit("kg").stock(10)
                .isAvailable(true).isActive(true).isOrganic(false).isFeatured(false)
                .category(category).seller(seller)
                .build();
    }

    @Test
    void getProductBySlug_shouldReturn() {
        when(productRepository.findBySlugWithImages("test-product")).thenReturn(Optional.of(product));
        when(productMapper.toResponse(any(Product.class))).thenReturn(
                ProductResponse.builder().id(1L).name("Test Product").build()
        );

        productService.getProductBySlug("test-product");

        verify(productRepository).findBySlugWithImages("test-product");
    }

    @Test
    void getProductBySlug_shouldThrowWhenNotFound() {
        when(productRepository.findBySlugWithImages("nonexistent")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.getProductBySlug("nonexistent"));
    }

    @Test
    void getProductById_shouldReturn() {
        when(productRepository.findByIdWithImages(1L)).thenReturn(Optional.of(product));
        when(productMapper.toResponse(any(Product.class))).thenReturn(
                ProductResponse.builder().id(1L).name("Test Product").build()
        );

        productService.getProductById(1L);

        verify(productRepository).findByIdWithImages(1L);
    }

    @Test
    void getProductById_shouldThrowWhenNotFound() {
        when(productRepository.findByIdWithImages(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.getProductById(99L));
    }

    @Test
    void createProduct_shouldCreate() {
        ProductRequest request = ProductRequest.builder()
                .name("New Product").description("Description")
                .price(new BigDecimal("200")).unit("kg").stock(15)
                .categoryId(1L).isOrganic(false)
                .build();

        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(userRepository.findById(1L)).thenReturn(Optional.of(seller));
        when(productRepository.save(any(Product.class))).thenAnswer(inv -> {
            Product p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });
        when(productMapper.toResponse(any(Product.class))).thenReturn(
                ProductResponse.builder().id(2L).name("New Product").build()
        );

        ProductResponse response = productService.createProduct(request, 1L);

        assertNotNull(response);
        assertEquals("New Product", response.getName());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void createProduct_shouldThrowWhenCategoryNotFound() {
        ProductRequest request = ProductRequest.builder()
                .name("New Product").description("Desc")
                .price(new BigDecimal("200")).unit("kg").stock(10)
                .categoryId(99L).build();

        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> productService.createProduct(request, 1L));
    }

    @Test
    void updateProduct_shouldUpdate() {
        ProductRequest request = ProductRequest.builder()
                .name("Updated").description("Updated desc")
                .price(new BigDecimal("150")).unit("kg").stock(20)
                .categoryId(1L).isOrganic(true)
                .build();

        when(productRepository.findByIdWithImages(1L)).thenReturn(Optional.of(product));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(category));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(any(Product.class))).thenReturn(
                ProductResponse.builder().id(1L).name("Updated").build()
        );

        productService.updateProduct(1L, request);

        assertEquals("Updated", product.getName());
        assertEquals(new BigDecimal("150"), product.getPrice());
        assertEquals(20, product.getStock());
        assertTrue(product.isOrganic());
    }

    @Test
    void deleteProduct_shouldSoftDelete() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        productService.deleteProduct(1L);

        assertNotNull(product.getDeletedAt());
        assertFalse(product.isActive());
        assertFalse(product.isAvailable());
        verify(productRepository).save(product);
    }

    @Test
    void ownsProduct_shouldReturnTrue() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertTrue(productService.ownsProduct(1L, 1L));
    }

    @Test
    void ownsProduct_shouldReturnFalse() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertFalse(productService.ownsProduct(1L, 99L));
    }

    @Test
    void toggleFeatured_shouldToggle() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(any(Product.class))).thenReturn(
                ProductResponse.builder().id(1L).build()
        );

        productService.toggleFeatured(1L);

        assertTrue(product.isFeatured());
    }

    @Test
    void activateProduct_shouldActivate() {
        product.setActive(false);
        product.setAvailable(false);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(any(Product.class))).thenReturn(
                ProductResponse.builder().id(1L).build()
        );

        productService.activateProduct(1L);

        assertTrue(product.isActive());
        assertTrue(product.isAvailable());
    }

    @Test
    void deactivateProduct_shouldDeactivate() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toResponse(any(Product.class))).thenReturn(
                ProductResponse.builder().id(1L).build()
        );

        productService.deactivateProduct(1L);

        assertFalse(product.isActive());
        assertFalse(product.isAvailable());
    }
}
