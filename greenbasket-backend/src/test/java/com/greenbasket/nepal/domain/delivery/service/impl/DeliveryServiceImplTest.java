package com.greenbasket.nepal.domain.delivery.service.impl;

import com.greenbasket.nepal.common.exception.BadRequestException;
import com.greenbasket.nepal.common.exception.ResourceNotFoundException;
import com.greenbasket.nepal.domain.delivery.dto.AssignDeliveryRequest;
import com.greenbasket.nepal.domain.delivery.dto.DeliveryResponse;
import com.greenbasket.nepal.domain.delivery.dto.DeliveryStatusUpdateRequest;
import com.greenbasket.nepal.domain.delivery.entity.Delivery;
import com.greenbasket.nepal.domain.delivery.entity.DeliveryStatus;
import com.greenbasket.nepal.domain.delivery.repository.DeliveryRepository;
import com.greenbasket.nepal.domain.delivery.service.DeliveryService;
import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.order.entity.OrderStatus;
import com.greenbasket.nepal.domain.order.repository.OrderRepository;
import com.greenbasket.nepal.domain.user.entity.Role;
import com.greenbasket.nepal.domain.user.entity.User;
import com.greenbasket.nepal.domain.user.repository.UserRepository;
import com.greenbasket.nepal.email.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeliveryServiceImplTest {

    @Mock private DeliveryRepository deliveryRepository;
    @Mock private OrderRepository orderRepository;
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    private DeliveryService deliveryService;
    private Order order;
    private User partner;

    @BeforeEach
    void setUp() {
        deliveryService = new DeliveryServiceImpl(
                deliveryRepository, orderRepository, userRepository, emailService
        );

        order = Order.builder()
                .id(1L).orderNumber("ORD-123").status(OrderStatus.PACKING)
                .user(User.builder().id(1L).fullName("Customer").email("cust@test.com").phone("9812345678").build())
                .deliveryAddress("Test Address").build();

        partner = User.builder()
                .id(2L).fullName("Partner").email("partner@test.com").phone("9812345679")
                .role(Role.builder().id(3L).name("DELIVERY_PARTNER").build())
                .build();
    }

    @Test
    void assignDelivery_shouldAssign() {
        AssignDeliveryRequest request = new AssignDeliveryRequest();
        request.setOrderId(1L);
        request.setDeliveryPartnerId(2L);

        when(deliveryRepository.existsByOrderId(1L)).thenReturn(false);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(userRepository.findById(2L)).thenReturn(Optional.of(partner));
        when(deliveryRepository.save(any(Delivery.class))).thenAnswer(inv -> {
            Delivery d = inv.getArgument(0);
            d.setId(1L);
            return d;
        });

        DeliveryResponse response = deliveryService.assignDelivery(request);

        assertNotNull(response);
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, order.getStatus());
        verify(emailService).sendDeliveryAssignedToPartner(any(Order.class), eq(partner));
        verify(emailService).sendDeliveryAssignedToCustomer(any(Order.class), eq(partner));
    }

    @Test
    void assignDelivery_shouldThrowWhenAlreadyAssigned() {
        AssignDeliveryRequest request = new AssignDeliveryRequest();
        request.setOrderId(1L);
        request.setDeliveryPartnerId(2L);

        when(deliveryRepository.existsByOrderId(1L)).thenReturn(true);

        assertThrows(BadRequestException.class, () -> deliveryService.assignDelivery(request));
    }

    @Test
    void assignDelivery_shouldThrowWhenOrderNotPacking() {
        order.setStatus(OrderStatus.PENDING);

        AssignDeliveryRequest request = new AssignDeliveryRequest();
        request.setOrderId(1L);
        request.setDeliveryPartnerId(2L);

        when(deliveryRepository.existsByOrderId(1L)).thenReturn(false);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));

        assertThrows(BadRequestException.class, () -> deliveryService.assignDelivery(request));
    }

    @Test
    void assignDelivery_shouldThrowWhenUserNotDeliveryPartner() {
        User customerUser = User.builder().id(3L)
                .role(Role.builder().id(1L).name("CUSTOMER").build()).build();

        AssignDeliveryRequest request = new AssignDeliveryRequest();
        request.setOrderId(1L);
        request.setDeliveryPartnerId(3L);

        when(deliveryRepository.existsByOrderId(1L)).thenReturn(false);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(order));
        when(userRepository.findById(3L)).thenReturn(Optional.of(customerUser));

        assertThrows(BadRequestException.class, () -> deliveryService.assignDelivery(request));
    }

    @Test
    void assignDelivery_shouldThrowWhenOrderNotFound() {
        AssignDeliveryRequest request = new AssignDeliveryRequest();
        request.setOrderId(99L);
        request.setDeliveryPartnerId(2L);

        when(deliveryRepository.existsByOrderId(99L)).thenReturn(false);
        when(orderRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> deliveryService.assignDelivery(request));
    }

    @Test
    void acceptDelivery_shouldAccept() {
        Delivery delivery = Delivery.builder()
                .id(1L).order(order).deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED).build();

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenReturn(delivery);

        DeliveryResponse response = deliveryService.acceptDelivery(1L, 2L);

        assertEquals(DeliveryStatus.PICKED_UP, delivery.getStatus());
    }

    @Test
    void acceptDelivery_shouldThrowWhenNotAssignedToPartner() {
        Delivery delivery = Delivery.builder()
                .id(1L).order(order).deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED).build();

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));

        assertThrows(BadRequestException.class, () -> deliveryService.acceptDelivery(1L, 99L));
    }

    @Test
    void acceptDelivery_shouldThrowWhenAlreadyPickedUp() {
        Delivery delivery = Delivery.builder()
                .id(1L).order(order).deliveryPartner(partner)
                .status(DeliveryStatus.PICKED_UP).build();

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));

        assertThrows(BadRequestException.class, () -> deliveryService.acceptDelivery(1L, 2L));
    }

    @Test
    void updateStatus_shouldTransition() {
        Delivery delivery = Delivery.builder()
                .id(1L).order(order).deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED).build();

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenReturn(delivery);

        DeliveryStatusUpdateRequest request = new DeliveryStatusUpdateRequest();
        request.setStatus(DeliveryStatus.PICKED_UP);

        DeliveryResponse response = deliveryService.updateStatus(1L, 2L, request);

        assertEquals(DeliveryStatus.PICKED_UP, delivery.getStatus());
    }

    @Test
    void updateStatus_shouldThrowForInvalidTransition() {
        Delivery delivery = Delivery.builder()
                .id(1L).order(order).deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED).build();

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));

        DeliveryStatusUpdateRequest request = new DeliveryStatusUpdateRequest();
        request.setStatus(DeliveryStatus.DELIVERED);

        assertThrows(BadRequestException.class,
                () -> deliveryService.updateStatus(1L, 2L, request));
    }

    @Test
    void updateStatus_shouldMarkOrderDeliveredOnFinalStep() {
        Delivery delivery = Delivery.builder()
                .id(1L).order(order).deliveryPartner(partner)
                .status(DeliveryStatus.ON_THE_WAY).build();

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));
        when(deliveryRepository.save(any(Delivery.class))).thenReturn(delivery);

        DeliveryStatusUpdateRequest request = new DeliveryStatusUpdateRequest();
        request.setStatus(DeliveryStatus.DELIVERED);

        deliveryService.updateStatus(1L, 2L, request);

        assertEquals(OrderStatus.DELIVERED, order.getStatus());
    }

    @Test
    void getDeliveryById_shouldReturn() {
        Delivery delivery = Delivery.builder().id(1L).order(order).deliveryPartner(partner)
                .status(DeliveryStatus.ASSIGNED).assignedAt(LocalDateTime.now()).build();

        when(deliveryRepository.findById(1L)).thenReturn(Optional.of(delivery));

        DeliveryResponse response = deliveryService.getDeliveryById(1L);

        assertNotNull(response);
    }

    @Test
    void getDeliveryById_shouldThrowWhenNotFound() {
        when(deliveryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> deliveryService.getDeliveryById(99L));
    }
}
