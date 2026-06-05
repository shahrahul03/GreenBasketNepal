package com.greenbasket.nepal.domain.product.service.impl;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.category.entity.Category;
import com.greenbasket.nepal.domain.category.repository.CategoryRepository;
import com.greenbasket.nepal.domain.product.dto.ProductImageResponse;
import com.greenbasket.nepal.domain.product.dto.ProductRequest;
import com.greenbasket.nepal.domain.product.dto.ProductResponse;
import com.greenbasket.nepal.domain.product.dto.ProductSearchRequest;
import com.greenbasket.nepal.domain.product.entity.Product;
import com.greenbasket.nepal.domain.product.entity.ProductImage;
import com.greenbasket.nepal.domain.product.mapper.ProductMapper;
import com.greenbasket.nepal.domain.product.repository.ProductImageRepository;
import com.greenbasket.nepal.domain.product.repository.ProductRepository;
import com.greenbasket.nepal.domain.product.service.ProductService;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.entity.ApprovalStatus;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Implementation of ProductService handling the core business logic for products.
 * 
 * Key Features:
 * - Paginated search with dynamic Specification building.
 * - Sort whitelisting to prevent database injection/errors.
 * - Soft-deletion of products.
 * - Local filesystem storage for product images.
 * - Ownership verification for secure management.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final List<String> ALLOWED_EXTENSIONS = List.of("jpg", "jpeg", "png", "webp");
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
    private static final String UPLOAD_DIR = "uploads/products";

    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    /**
     * Fetches a product by ID including its associated images.
     */
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toResponse(product);
    }

    /**
     * Fetches a product by its unique slug including its associated images.
     */
    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlugWithImages(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return productMapper.toResponse(product);
    }

    /**
     * White-list of fields allowed for sorting to prevent invalid property access errors.
     */
    private static final java.util.Set<String> ALLOWED_SORT_FIELDS = java.util.Set.of(
            "id", "name", "price", "stock", "createdAt", "updatedAt", "soldCount"
    );

    /**
     * Performs a flexible, paginated search for products.
     * 
     * Security: Implements a sort whitelist. If an invalid sort field is provided, 
     * it silently falls back to 'createdAt DESC' to ensure API stability.
     * 
     * @param request search filters and pagination settings
     * @return a paged response containing product DTOs
     */
    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> searchProducts(ProductSearchRequest request) {
        if (request.getCategoryId() == null && request.getCategory() != null && !request.getCategory().isBlank()) {
            categoryRepository.findBySlug(request.getCategory().trim().toLowerCase())
                    .ifPresent(cat -> request.setCategoryId(cat.getId()));
        }

        Specification<Product> spec = buildSearchSpecification(request);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt"); // Default fallback

        if (StringUtils.hasText(request.getSort()) && request.getSort().contains(",")) {
            try {
                String[] parts = request.getSort().split(",");
                String field = parts[0].trim();
                String direction = parts[1].trim();

                if (ALLOWED_SORT_FIELDS.contains(field)) {
                    sort = Sort.by(Sort.Direction.fromString(direction), field);
                } else {
                    log.warn("Invalid sort field requested: {}. Falling back to createdAt DESC", field);
                }
            } catch (Exception e) {
                log.warn("Error parsing sort parameter: {}. Falling back to default", request.getSort());
            }
        } else if (StringUtils.hasText(request.getSortBy()) && ALLOWED_SORT_FIELDS.contains(request.getSortBy())) {
            sort = Sort.by(request.getSortDirection(), request.getSortBy());
        }

        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        List<ProductResponse> products = productPage.getContent()
                .stream()
                .map(productMapper::toResponse)
                .toList();

        return PagedResponse.<ProductResponse>builder()
                .content(products)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .first(productPage.isFirst())
                .last(productPage.isLast())
                .build();
    }

    /**
     * Creates a new product listing.
     * 
     * Business Rules:
     * - Seller must be an approved FARMER or an ADMIN.
     * - Price must be positive.
     * - Automatic slug generation based on product name.
     */
    @Override
    @Transactional
    public ProductResponse createProduct(ProductRequest request, Long sellerId) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", sellerId));

        if (seller.getRole().getName().equals("FARMER") && seller.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new BadRequestException("Your account is not yet approved. Please wait for admin approval.");
        }

        if (request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Price must be greater than zero");
        }

        Product product = Product.builder()
                .name(request.getName().trim())
                .slug(productMapper.generateSlug(request.getName()))
                .summary(request.getSummary())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock() != null ? request.getStock() : 0)
                .unit(request.getUnit() != null ? request.getUnit() : "kg")
                .isOrganic(request.getIsOrganic() != null && request.getIsOrganic())
                .category(category)
                .seller(seller)
                .imageUrl(request.getImageUrl())
                .build();

        product = productRepository.save(product);

        log.info("Product created: {} (id: {}) by seller: {}", product.getName(), product.getId(), sellerId);
        return productMapper.toResponse(product);
    }

    /**
     * Updates product details.
     * 
     * Logic: Only non-null fields in the request are updated (partial update support).
     * Automatic slug re-generation if the name changes.
     */
    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findByIdWithImages(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        if (request.getName() != null) {
            product.setName(request.getName().trim());
            product.setSlug(productMapper.generateSlug(request.getName()));
        }
        if (request.getSummary() != null) {
            product.setSummary(request.getSummary());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            if (request.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Price must be greater than zero");
            }
            product.setPrice(request.getPrice());
        }
        if (request.getStock() != null) {
            if (request.getStock() < 0) {
                throw new BadRequestException("Stock cannot be negative");
            }
            product.setStock(request.getStock());
        }
        if (request.getUnit() != null) {
            product.setUnit(request.getUnit());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            product.setCategory(category);
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
        }
        if (request.getIsOrganic() != null) {
            product.setOrganic(request.getIsOrganic());
        }

        product = productRepository.save(product);

        log.info("Product updated: {} (id: {})", product.getName(), id);
        return productMapper.toResponse(product);
    }

    /**
     * Performs a soft-delete on a product.
     * Logic: Sets the 'deletedAt' field. Repository queries automatically exclude soft-deleted items.
     */
    @Override
    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setDeletedAt(LocalDateTime.now());
        product.setActive(false);
        product.setAvailable(false);
        productRepository.save(product);

        log.info("Product soft-deleted: {} (id: {})", product.getName(), id);
    }

    /**
     * Uploads and stores a product image on the local filesystem.
     * 
     * Security/Validation:
     * - Validates file extension (jpg, png, webp).
     * - Limits file size to 5MB.
     * - Generates a UUID filename to prevent collisions and path traversal.
     */
    @Override
    @Transactional
    public ProductResponse uploadImage(Long productId, MultipartFile file, boolean isPrimary) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        validateImage(file);

        String filename = storeImage(file);
        int sortOrder = (int) productImageRepository.countByProductId(productId);

        ProductImage image = ProductImage.builder()
                .product(product)
                .imageUrl(filename)
                .isPrimary(isPrimary)
                .sortOrder(sortOrder)
                .build();

        image = productImageRepository.save(image);

        if (isPrimary || product.getImageUrl() == null) {
            product.setImageUrl(filename);
            productRepository.save(product);
        }

        log.info("Image uploaded for product {}: {}", productId, filename);
        return productMapper.toResponse(productRepository.findByIdWithImages(productId).orElse(product));
    }

    /**
     * Deletes a product image from the filesystem and database.
     * 
     * Flow:
     * 1. Remove database record.
     * 2. Delete physical file.
     * 3. If the deleted image was the primary one, promote another image to primary.
     */
    @Override
    @Transactional
    public void deleteImage(Long imageId) {
        ProductImage image = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        Product product = image.getProduct();

        deleteFile(image.getImageUrl());
        productImageRepository.delete(image);

        if (image.isPrimary() || (product.getImageUrl() != null
                && product.getImageUrl().equals(image.getImageUrl()))) {
            productImageRepository.findByProductIdAndIsPrimaryTrue(product.getId())
                    .ifPresentOrElse(
                            primary -> product.setImageUrl(primary.getImageUrl()),
                            () -> {
                                List<ProductImage> remaining = productImageRepository
                                        .findByProductIdOrderBySortOrderAsc(product.getId());
                                if (!remaining.isEmpty()) {
                                    product.setImageUrl(remaining.getFirst().getImageUrl());
                                } else {
                                    product.setImageUrl(null);
                                }
                            });
            productRepository.save(product);
        }

        log.info("Image deleted: {} (product: {})", imageId, product.getId());
    }

    /**
     * Verifies if a user owns a specific product.
     */
    @Override
    @Transactional(readOnly = true)
    public boolean ownsProduct(Long productId, Long userId) {
        return productRepository.findById(productId)
                .map(product -> product.getSeller().getId().equals(userId))
                .orElse(false);
    }

    /**
     * Verifies if a user owns the product associated with a specific image.
     */
    @Override
    @Transactional(readOnly = true)
    public boolean ownsImage(Long imageId, Long userId) {
        return productImageRepository.findById(imageId)
                .map(image -> image.getProduct().getSeller().getId().equals(userId))
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public long countLowStockBySeller(Long sellerId) {
        return productRepository.countLowStockBySeller(sellerId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countOutOfStockBySeller(Long sellerId) {
        return productRepository.countOutOfStockBySeller(sellerId);
    }

    /**
     * Activates a product to be visible in the marketplace.
     */
    @Override
    @Transactional
    public ProductResponse activateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(true);
        product.setAvailable(true);
        product = productRepository.save(product);
        log.info("Product activated: {} (id: {})", product.getName(), id);
        return productMapper.toResponse(product);
    }

    /**
     * Deactivates a product, hiding it from customers while preserving data.
     */
    @Override
    @Transactional
    public ProductResponse deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setActive(false);
        product.setAvailable(false);
        product = productRepository.save(product);
        log.info("Product deactivated: {} (id: {})", product.getName(), id);
        return productMapper.toResponse(product);
    }

    /**
     * Toggles whether a product is 'featured' on the homepage.
     */
    @Override
    @Transactional
    public ProductResponse toggleFeatured(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        product.setFeatured(!product.isFeatured());
        product = productRepository.save(product);
        log.info("Product featured toggled: {} (id: {}) -> {}", product.getName(), id, product.isFeatured());
        return productMapper.toResponse(product);
    }

    /**
     * Promotes a specific image to be the 'primary' image for a product.
     */
    @Override
    @Transactional
    public void setPrimaryImage(Long productId, Long imageId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        ProductImage newPrimary = productImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("ProductImage", "id", imageId));

        if (!newPrimary.getProduct().getId().equals(productId)) {
            throw new BadRequestException("Image does not belong to this product");
        }

        productImageRepository.findByProductIdAndIsPrimaryTrue(productId)
                .ifPresent(old -> {
                    old.setPrimary(false);
                    productImageRepository.save(old);
                });

        newPrimary.setPrimary(true);
        productImageRepository.save(newPrimary);

        product.setImageUrl(newPrimary.getImageUrl());
        productRepository.save(product);

        log.info("Primary image set: {} for product: {}", imageId, productId);
    }

    /**
     * Dynamic JPA Specification builder for product search.
     */
    private Specification<Product> buildSearchSpecification(ProductSearchRequest request) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isNull(root.get("deletedAt")));
            predicates.add(cb.isTrue(root.get("isActive")));

            if (request.getSearch() != null && !request.getSearch().isBlank()) {
                String pattern = "%" + request.getSearch().trim().toLowerCase() + "%";
                Predicate nameLike = cb.like(cb.lower(root.get("name")), pattern);
                Predicate summaryLike = cb.like(cb.lower(root.get("summary")), pattern);
                Predicate descLike = cb.like(cb.lower(root.get("description")), pattern);
                predicates.add(cb.or(nameLike, summaryLike, descLike));
            }

            if (request.getCategoryId() != null) {
                predicates.add(cb.equal(root.get("category").get("id"), request.getCategoryId()));
            }

            if (request.getSellerId() != null) {
                predicates.add(cb.equal(root.get("seller").get("id"), request.getSellerId()));
            }

            if (request.getMinPrice() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), request.getMinPrice()));
            }

            if (request.getMaxPrice() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), request.getMaxPrice()));
            }

            if (request.getIsOrganic() != null) {
                predicates.add(cb.equal(root.get("isOrganic"), request.getIsOrganic()));
            }

            if (request.getIsAvailable() != null) {
                predicates.add(cb.equal(root.get("isAvailable"), request.getIsAvailable()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Basic image validation (size, extension).
     */
    private void validateImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum limit of 5MB");
        }

        String extension = StringUtils.getFilenameExtension(
                Objects.requireNonNull(file.getOriginalFilename()));
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BadRequestException(
                    "Invalid file type. Allowed: " + String.join(", ", ALLOWED_EXTENSIONS));
        }
    }

    /**
     * Persists image file to the local filesystem.
     */
    private String storeImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String extension = StringUtils.getFilenameExtension(
                    Objects.requireNonNull(file.getOriginalFilename()));
            String filename = UUID.randomUUID() + "." + extension;

            Path targetPath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/products/" + filename;
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    /**
     * Physically deletes a file from the disk.
     */
    private void deleteFile(String filePath) {
        if (filePath == null || filePath.isBlank()) return;

        try {
            String filename = filePath.substring(filePath.lastIndexOf('/') + 1);
            Path targetPath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Files.deleteIfExists(targetPath);
        } catch (IOException e) {
            log.warn("Failed to delete file: {}", filePath, e);
        }
    }
}
