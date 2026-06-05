package com.greenbasket.nepal.domain.product.repository;

import com.greenbasket.nepal.domain.product.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Optional<Product> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByCategoryId(Long categoryId);

    long countByCategoryIdAndIsActiveTrue(Long categoryId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.seller.id = :sellerId AND p.deletedAt IS NULL")
    long countBySellerId(@Param("sellerId") Long sellerId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.images WHERE p.id = :id AND p.deletedAt IS NULL")
    Optional<Product> findByIdWithImages(@Param("id") Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.images WHERE p.slug = :slug AND p.deletedAt IS NULL")
    Optional<Product> findBySlugWithImages(@Param("slug") String slug);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL")
    long countActiveProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL AND p.isOrganic = true")
    long countOrganicProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL AND p.stock = 0")
    long countOutOfStockProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL AND p.stock > 0 AND p.stock <= 10")
    long countLowStockProducts();

    @Query("SELECT c.name, COUNT(p) FROM Product p JOIN p.category c " +
           "WHERE p.deletedAt IS NULL GROUP BY c.name ORDER BY COUNT(p) DESC")
    List<Object[]> countByCategory();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL AND p.seller.id = :sellerId AND p.stock > 0 AND p.stock <= 10")
    long countLowStockBySeller(@Param("sellerId") Long sellerId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deletedAt IS NULL AND p.seller.id = :sellerId AND p.stock = 0")
    long countOutOfStockBySeller(@Param("sellerId") Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId AND p.deletedAt IS NULL")
    List<Product> findBySellerId(@Param("sellerId") Long sellerId);
}
