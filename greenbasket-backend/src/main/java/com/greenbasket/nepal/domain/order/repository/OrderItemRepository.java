package com.greenbasket.nepal.domain.order.repository;

import com.greenbasket.nepal.domain.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import org.springframework.data.domain.Pageable;
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    long countByOrderId(Long orderId);

    @Query(value = """
            SELECT oi.product_id,
                   oi.product_name,
                   oi.image_url,
                   SUM(oi.quantity) as total_sold,
                   SUM(oi.subtotal) as total_revenue
            FROM order_items oi
            WHERE oi.product_id IS NOT NULL
            GROUP BY oi.product_id, oi.product_name, oi.image_url
            ORDER BY total_sold DESC
            """,
            nativeQuery = true)
    List<Object[]> findTopSellingProducts(Pageable pageable);
}
