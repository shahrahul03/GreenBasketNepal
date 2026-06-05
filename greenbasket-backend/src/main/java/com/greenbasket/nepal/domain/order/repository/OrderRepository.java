package com.greenbasket.nepal.domain.order.repository;

import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findByOrderNumber(String orderNumber);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findById(Long id);

    @EntityGraph(attributePaths = {"items", "user"})
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.status = :status ORDER BY o.createdAt DESC")
    Page<Order> findByStatus(@Param("status") OrderStatus status, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status <> 'CANCELLED'")
    BigDecimal getTotalRevenueExcludingCancelled();

    @Query("SELECT COALESCE(AVG(o.total), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal getAverageOrderValue();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    @Query("SELECT FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m') as month, " +
           "COUNT(o), COALESCE(SUM(o.total), 0) FROM Order o " +
           "WHERE o.status = 'DELIVERED' " +
           "GROUP BY FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m') ORDER BY month")
    List<Object[]> getMonthlySalesReport();

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o " +
           "WHERE o.status = 'DELIVERED' AND DATE(o.createdAt) = CURRENT_DATE")
    BigDecimal getTodayRevenue();

    @Query("SELECT DISTINCT o FROM Order o JOIN FETCH o.items i " +
           "WHERE i.productId IN " +
           "(SELECT p.id FROM Product p WHERE p.seller.id = :sellerId) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findOrdersBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    List<Order> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(o) > 0 FROM Order o JOIN o.items i " +
           "WHERE i.productId IN (SELECT p.id FROM Product p WHERE p.seller.id = :farmerId) " +
           "AND o.id = :orderId")
    boolean farmerOwnsOrder(@Param("farmerId") Long farmerId, @Param("orderId") Long orderId);

    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi " +
           "WHERE oi.productId IN (SELECT p.id FROM Product p WHERE p.seller.id = :sellerId) " +
           "AND oi.order.status = 'DELIVERED'")
    BigDecimal getFarmerTotalRevenue(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi " +
           "WHERE oi.productId IN (SELECT p.id FROM Product p WHERE p.seller.id = :sellerId) " +
           "AND oi.order.status = 'DELIVERED' " +
           "AND DATE(oi.order.createdAt) = CURRENT_DATE")
    BigDecimal getFarmerTodayRevenue(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(oi.subtotal), 0) FROM OrderItem oi " +
           "WHERE oi.productId IN (SELECT p.id FROM Product p WHERE p.seller.id = :sellerId) " +
           "AND oi.order.status = 'DELIVERED' " +
           "AND YEAR(oi.order.createdAt) = YEAR(CURRENT_DATE) " +
           "AND MONTH(oi.order.createdAt) = MONTH(CURRENT_DATE)")
    BigDecimal getFarmerMonthRevenue(@Param("sellerId") Long sellerId);

    @Query("SELECT FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m'), COALESCE(SUM(oi.subtotal), 0) " +
           "FROM OrderItem oi JOIN oi.order o " +
           "WHERE oi.productId IN (SELECT p.id FROM Product p WHERE p.seller.id = :sellerId) " +
           "AND o.status = 'DELIVERED' " +
           "GROUP BY FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m') ORDER BY FUNCTION('DATE_FORMAT', o.createdAt, '%Y-%m')")
    List<Object[]> getFarmerMonthlySales(@Param("sellerId") Long sellerId);

    @Query("SELECT oi.productId, oi.productName, oi.imageUrl, SUM(oi.quantity), SUM(oi.subtotal) " +
           "FROM OrderItem oi " +
           "WHERE oi.productId IN (SELECT p.id FROM Product p WHERE p.seller.id = :sellerId) " +
           "AND oi.order.status = 'DELIVERED' " +
           "GROUP BY oi.productId, oi.productName, oi.imageUrl " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> getFarmerTopProducts(@Param("sellerId") Long sellerId, Pageable pageable);
}
