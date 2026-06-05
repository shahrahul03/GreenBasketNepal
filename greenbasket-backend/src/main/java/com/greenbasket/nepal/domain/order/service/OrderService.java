package com.greenbasket.nepal.domain.order.service;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.order.dto.*;

public interface OrderService {

    OrderResponse placeOrder(Long userId, PlaceOrderRequest request);

    OrderResponse getOrderById(Long userId, Long orderId);

    OrderResponse getOrderByOrderNumber(String orderNumber);

    PagedResponse<OrderResponse> getOrderHistory(Long userId, OrderSearchRequest request);

    OrderResponse cancelOrder(Long userId, Long orderId, CancelOrderRequest request);

    OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request);

    PagedResponse<OrderResponse> getAllOrders(OrderSearchRequest request);

    PagedResponse<OrderResponse> getFarmerOrders(Long farmerId, OrderSearchRequest request);

    boolean farmerOwnsOrder(Long farmerId, Long orderId);
}
