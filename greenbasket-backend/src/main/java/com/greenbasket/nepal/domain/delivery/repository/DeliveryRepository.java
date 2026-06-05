package com.greenbasket.nepal.domain.delivery.repository;

import com.greenbasket.nepal.domain.delivery.entity.Delivery;
import com.greenbasket.nepal.domain.delivery.entity.DeliveryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long>, JpaSpecificationExecutor<Delivery> {

    @EntityGraph(attributePaths = {"order", "deliveryPartner"})
    Optional<Delivery> findByOrderId(Long orderId);

    @EntityGraph(attributePaths = {"order", "order.user", "deliveryPartner"})
    Optional<Delivery> findById(Long id);

    @EntityGraph(attributePaths = {"order", "order.user", "deliveryPartner"})
    List<Delivery> findByDeliveryPartnerIdOrderByCreatedAtDesc(Long deliveryPartnerId);

    @EntityGraph(attributePaths = {"order", "order.user", "deliveryPartner"})
    Page<Delivery> findByDeliveryPartnerId(Long deliveryPartnerId, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "order.user", "deliveryPartner"})
    Optional<Delivery> findByIdAndDeliveryPartnerId(Long id, Long deliveryPartnerId);

    long countByDeliveryPartnerIdAndStatus(Long deliveryPartnerId, DeliveryStatus status);

    @EntityGraph(attributePaths = {"order", "order.user", "deliveryPartner"})
    List<Delivery> findByDeliveryPartnerIdAndStatusOrderByCreatedAtDesc(
            Long deliveryPartnerId, DeliveryStatus status);

    List<Delivery> findByStatus(DeliveryStatus status);

    @Query("SELECT d FROM Delivery d WHERE d.deliveryPartner.id = :partnerId " +
           "AND d.status <> 'DELIVERED' ORDER BY d.createdAt DESC")
    @EntityGraph(attributePaths = {"order", "order.user"})
    List<Delivery> findActiveByPartnerId(@Param("partnerId") Long partnerId);

    boolean existsByOrderId(Long orderId);
}
