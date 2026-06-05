package com.greenbasket.nepal.domain.product.controller;

import com.greenbasket.nepal.common.dto.ApiResponse;
import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.domain.product.dto.ProductRequest;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import com.greenbasket.nepal.domain.product.dto.ProductSearchRequest;
import com.greenbasket.nepal.domain.product.service.ProductService;
import com.greenbasket.nepal.security.annotation.CurrentUser;
import com.greenbasket.nepal.security.service.CustomUserDetailsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Controller handling product-related operations for both public marketplace
 * and private management (Farmer/Admin).
 * 
 * Flow:
 * - Public: Browsing, searching, and viewing details.
 * - Farmers: Creating, updating, and managing their own product inventory/images.
 * - Admins: Global oversight, activation/deactivation, and featuring products.
 */
@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    /**
     * Searches and retrieves a paginated list of products based on various filters.
     * 
     * Supported filters in ProductSearchRequest:
     * - Search term (name, summary, description)
     * - Category ID or Slug
     * - Seller ID
     * - Price range (min/max)
     * - Organic flag
     * - Availability status
     * 
     * @param searchRequest filtering and pagination parameters
     * @return paged list of product responses
     */
    @GetMapping("/api/v1/products")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> searchProducts(
            @ModelAttribute ProductSearchRequest searchRequest) {
        PagedResponse<ProductResponse> products = productService.searchProducts(searchRequest);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    /**
     * Retrieves detailed information for a single product by its unique ID.
     */
    @GetMapping("/api/v1/products/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        ProductResponse product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    /**
     * Retrieves detailed information for a single product using its SEO-friendly slug.
     */
    @GetMapping("/api/v1/products/slug/{slug}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductBySlug(@PathVariable String slug) {
        ProductResponse product = productService.getProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(product));
    }

    /**
     * Creates a new product listing.
     * Accessible by ADMIN and approved FARMER roles.
     * 
     * @param request product details
     * @param currentUser authenticated user (the seller)
     * @return the created product response
     */
    @PostMapping("/api/v1/products")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(
            @Valid @RequestBody ProductRequest request,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        ProductResponse product = productService.createProduct(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product created successfully", product));
    }

    /**
     * Updates an existing product.
     * Admins can update any product; Farmers can only update products they own.
     */
    @PutMapping("/api/v1/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        if (!currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                && !productService.ownsProduct(id, currentUser.getId())) {
            throw new BadRequestException("You do not own this product");
        }
        ProductResponse product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    /**
     * Soft-deletes a product listing.
     * Logic: Sets deleted_at timestamp and disables availability.
     */
    @DeleteMapping("/api/v1/products/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @PathVariable Long id,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        if (!currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                && !productService.ownsProduct(id, currentUser.getId())) {
            throw new BadRequestException("You do not own this product");
        }
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    /**
     * Uploads an image for a specific product.
     * Supports multi-image management; can set an image as primary.
     */
    @PostMapping(
            value = "/api/v1/products/{productId}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<ProductResponse>> uploadImage(
            @PathVariable Long productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "isPrimary", defaultValue = "false") boolean isPrimary,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        if (!currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                && !productService.ownsProduct(productId, currentUser.getId())) {
            throw new BadRequestException("You do not own this product");
        }
        ProductResponse product = productService.uploadImage(productId, file, isPrimary);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded successfully", product));
    }

    /**
     * Deletes a specific product image and updates the product's main image 
     * if the deleted image was the primary one.
     */
    @DeleteMapping("/api/v1/products/images/{imageId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @PathVariable Long imageId,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        if (!currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                && !productService.ownsImage(imageId, currentUser.getId())) {
            throw new BadRequestException("You do not own this image");
        }
        productService.deleteImage(imageId);
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully", null));
    }

    /**
     * Changes which image is considered the 'primary' (main) image for a product.
     */
    @PutMapping("/api/v1/products/{productId}/images/{imageId}/primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FARMER')")
    public ResponseEntity<ApiResponse<Void>> setPrimaryImage(
            @PathVariable Long productId,
            @PathVariable Long imageId,
            @CurrentUser CustomUserDetailsService.CustomUserDetails currentUser) {
        if (!currentUser.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))
                && !productService.ownsProduct(productId, currentUser.getId())) {
            throw new BadRequestException("You do not own this product");
        }
        productService.setPrimaryImage(productId, imageId);
        return ResponseEntity.ok(ApiResponse.success("Primary image updated", null));
    }

    /**
     * Admin-only: Re-activates a previously deactivated product.
     */
    @PostMapping("/api/v1/admin/products/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> activateProduct(@PathVariable Long id) {
        ProductResponse product = productService.activateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product activated successfully", product));
    }

    /**
     * Admin-only: Deactivates a product, making it invisible in the public marketplace.
     */
    @PostMapping("/api/v1/admin/products/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> deactivateProduct(@PathVariable Long id) {
        ProductResponse product = productService.deactivateProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", product));
    }

    /**
     * Admin-only: Toggles the 'featured' status for a product to highlight it on the home page.
     */
    @PostMapping("/api/v1/admin/products/{id}/featured")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductResponse>> toggleFeatured(@PathVariable Long id) {
        ProductResponse product = productService.toggleFeatured(id);
        return ResponseEntity.ok(ApiResponse.success("Product featured toggled successfully", product));
    }
}
