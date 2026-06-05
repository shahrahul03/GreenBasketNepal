package com.greenbasket.nepal.domain.product.service;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.product.dto.ProductRequest;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import com.greenbasket.nepal.domain.product.dto.ProductSearchRequest;
import org.springframework.web.multipart.MultipartFile;

public interface ProductService {

    ProductResponse getProductById(Long id);

    ProductResponse getProductBySlug(String slug);

    PagedResponse<ProductResponse> searchProducts(ProductSearchRequest request);

    ProductResponse createProduct(ProductRequest request, Long sellerId);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    ProductResponse uploadImage(Long productId, MultipartFile file, boolean isPrimary);

    void deleteImage(Long imageId);

    void setPrimaryImage(Long productId, Long imageId);

    boolean ownsProduct(Long productId, Long userId);

    boolean ownsImage(Long imageId, Long userId);

    long countLowStockBySeller(Long sellerId);

    long countOutOfStockBySeller(Long sellerId);

    ProductResponse activateProduct(Long id);

    ProductResponse deactivateProduct(Long id);

    ProductResponse toggleFeatured(Long id);
}
