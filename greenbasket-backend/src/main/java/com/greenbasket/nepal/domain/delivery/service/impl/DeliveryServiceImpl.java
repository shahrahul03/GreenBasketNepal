package com.greenbasket.nepal.domain.delivery.service.impl;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.delivery.dto.*;
import com.greenbasket.nepal.domain.delivery.entity.Delivery;
import com.greenbasket.nepal.domain.delivery.entity.DeliveryStatus;
import com.greenbasket.nepal.domain.delivery.repository.DeliveryRepository;
import com.greenbasket.nepal.domain.delivery.service.DeliveryService;
import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.email.service.EmailService;
import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.user.entity.User;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryServiceImpl implements DeliveryService {

    private static final Map<DeliveryStatus, Set<DeliveryStatus>> VALID_TRANSITIONS = Map.of(
            DeliveryStatus.ASSIGNED, Set.of(DeliveryStatus.PICKED_UP),
            DeliveryStatus.PICKED_UP, Set.of(DeliveryStatus.ON_THE_WAY),
            DeliveryStatus.ON_THE_WAY, Set.of(DeliveryStatus.DELIVERED),
            DeliveryStatus.DELIVERED, Set.of()
    );

    private static final Set<DeliveryStatus> ACTIVE_STATUSES = Set.of(
            DeliveryStatus.ASSIGNED,
            DeliveryStatus.PICKED_UP,
            DeliveryStatus.ON_THE_WAY
    );

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public DeliveryResponse assignDelivery(AssignDeliveryRequest request) {
        if (deliveryRepository.existsByOrderId(request.getOrderId())) {
            throw new BadRequestException("Delivery already assigned for this order");
        }

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", request.getOrderId()));

        if (order.getStatus() != OrderStatus.PACKING) {
            throw new BadRequestException(
                    "Order must be in PACKING status before assigning delivery. " +
                    "Current status: " + order.getStatus());
        }

        User partner = userRepository.findById(request.getDeliveryPartnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery partner", "id", request.getDeliveryPartnerId()));

        if (!partner.getRole().getName().equals("DELIVERY_PARTNER")) {
            throw new BadRequestException("User is not a delivery partner");
        }

        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setOutForDeliveryAt(LocalDateTime.now());
        orderRepository.save(order);

        Delivery delivery = Delivery.builder()
                .order(order)
                .deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED)
                .assignedAt(LocalDateTime.now())
                .build();

        delivery = deliveryRepository.save(delivery);

        log.info("Delivery assigned. Order: {}, Partner: {}",
                order.getOrderNumber(), partner.getFullName());

        emailService.sendDeliveryAssignedToPartner(order, partner);
        emailService.sendDeliveryAssignedToCustomer(order, partner);

        return toResponse(delivery);
    }

    @Override
    @Transactional
    public DeliveryResponse acceptDelivery(Long deliveryId, Long partnerId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));

        if (!delivery.getDeliveryPartner().getId().equals(partnerId)) {
            throw new BadRequestException("This delivery is not assigned to you");
        }

        if (delivery.getStatus() != DeliveryStatus.ASSIGNED) {
            throw new BadRequestException(
                    "Cannot accept delivery. Current status: " + delivery.getStatus());
        }

        delivery.setStatus(DeliveryStatus.PICKED_UP);
        delivery.setPickedUpAt(LocalDateTime.now());
        delivery = deliveryRepository.save(delivery);

        log.info("Delivery accepted. Delivery: {}, Partner: {}", deliveryId, partnerId);

        return toResponse(delivery);
    }

    @Override
    @Transactional
    public DeliveryResponse updateStatus(Long deliveryId, Long partnerId, DeliveryStatusUpdateRequest request) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));

        if (!delivery.getDeliveryPartner().getId().equals(partnerId)) {
            throw new BadRequestException("This delivery is not assigned to you");
        }

        DeliveryStatus currentStatus = delivery.getStatus();
        DeliveryStatus newStatus = request.getStatus();

        Set<DeliveryStatus> allowed = VALID_TRANSITIONS.get(currentStatus);
        if (allowed == null || !allowed.contains(newStatus)) {
            throw new BadRequestException(
                    "Cannot transition from " + currentStatus + " to " + newStatus);
        }

        setStatusTimestamp(delivery, newStatus);

        if (request.getDeliveryNotes() != null) {
            delivery.setDeliveryNotes(request.getDeliveryNotes());
        }

        if (request.getRecipientPhone() != null) {
            delivery.setRecipientPhone(request.getRecipientPhone());
        }

        delivery.setStatus(newStatus);
        delivery = deliveryRepository.save(delivery);

        if (newStatus == DeliveryStatus.DELIVERED) {
            Order order = delivery.getOrder();
            order.setStatus(OrderStatus.DELIVERED);
            order.setDeliveredAt(LocalDateTime.now());
            orderRepository.save(order);

            log.info("Order marked as DELIVERED: {}", order.getOrderNumber());
        }

        log.info("Delivery status updated: {} → {} for delivery: {}",
                currentStatus, newStatus, deliveryId);

        return toResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryById(Long deliveryId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery", "id", deliveryId));
        return toResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public DeliveryResponse getDeliveryByOrderId(Long orderId) {
        Delivery delivery = deliveryRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery not found for order", "orderId", orderId));
        return toResponse(delivery);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryResponse> getMyActiveDeliveries(Long partnerId) {
        return deliveryRepository.findActiveByPartnerId(partnerId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DeliveryResponse> getMyDeliveryHistory(Long partnerId, DeliverySearchRequest request) {
        Sort sort = Sort.by(request.getSortDirection(), request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Specification<Delivery> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("deliveryPartner").get("id"), partnerId));
            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Delivery> deliveryPage = deliveryRepository.findAll(spec, pageable);

        return toPagedResponse(deliveryPage);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<DeliveryResponse> getAllDeliveries(DeliverySearchRequest request) {
        Specification<Delivery> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }
            if (request.getDeliveryPartnerId() != null) {
                predicates.add(cb.equal(
                        root.get("deliveryPartner").get("id"), request.getDeliveryPartnerId()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.by(request.getSortDirection(), request.getSortBy());
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Delivery> deliveryPage = deliveryRepository.findAll(spec, pageable);

        return toPagedResponse(deliveryPage);
    }

    private void setStatusTimestamp(Delivery delivery, DeliveryStatus status) {
        LocalDateTime now = LocalDateTime.now();
        switch (status) {
            case PICKED_UP -> delivery.setPickedUpAt(now);
            case ON_THE_WAY -> delivery.setOnTheWayAt(now);
            case DELIVERED -> delivery.setDeliveredAt(now);
        }
    }

    private PagedResponse<DeliveryResponse> toPagedResponse(Page<Delivery> deliveryPage) {
        List<DeliveryResponse> deliveries = deliveryPage.getContent()
                .stream()
                .map(this::toResponse)
                .toList();

        return PagedResponse.<DeliveryResponse>builder()
                .content(deliveries)
                .page(deliveryPage.getNumber())
                .size(deliveryPage.getSize())
                .totalElements(deliveryPage.getTotalElements())
                .totalPages(deliveryPage.getTotalPages())
                .first(deliveryPage.isFirst())
                .last(deliveryPage.isLast())
                .build();
    }

    private DeliveryResponse toResponse(Delivery delivery) {
        Order order = delivery.getOrder();

        DeliveryResponse.OrderInfo orderInfo = DeliveryResponse.OrderInfo.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .customerName(order.getUser().getFullName())
                .customerPhone(order.getUser().getPhone())
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryNotes(order.getDeliveryNotes())
                .total(order.getTotal())
                .build();

        DeliveryResponse.DeliveryPartnerInfo partnerInfo = null;
        if (delivery.getDeliveryPartner() != null) {
            partnerInfo = DeliveryResponse.DeliveryPartnerInfo.builder()
                    .id(delivery.getDeliveryPartner().getId())
                    .fullName(delivery.getDeliveryPartner().getFullName())
                    .phone(delivery.getDeliveryPartner().getPhone())
                    .build();
        }

        return DeliveryResponse.builder()
                .id(delivery.getId())
                .status(delivery.getStatus())
                .order(orderInfo)
                .deliveryPartner(partnerInfo)
                .assignedAt(delivery.getAssignedAt())
                .pickedUpAt(delivery.getPickedUpAt())
                .onTheWayAt(delivery.getOnTheWayAt())
                .deliveredAt(delivery.getDeliveredAt())
                .deliveryNotes(delivery.getDeliveryNotes())
                .recipientPhone(delivery.getRecipientPhone())
                .recipientImageUrl(delivery.getRecipientImageUrl())
                .createdAt(delivery.getCreatedAt())
                .build();
    }
}
