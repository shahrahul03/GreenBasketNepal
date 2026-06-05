package com.greenbasket.nepal.email.service;

import com.greenbasket.nepal.domain.order.entity.Order;
import com.greenbasket.nepal.domain.user.entity.User;

import java.util.List;
import java.util.Map;

public interface EmailService {

    void sendWelcomeEmail(User user);

    void sendOrderConfirmation(Order order);

    void sendOrderDelivered(Order order);

    void sendOrderCancelled(Order order);

    void sendFarmerApproved(User farmer);

    void sendFarmerRejected(User farmer);

    void sendFarmerRegistrationAlert(User farmer);

    void sendNewOrderToFarmers(Order order);

    void sendDeliveryAssignedToPartner(Order order, User partner);

    void sendDeliveryAssignedToCustomer(Order order, User partner);
}
