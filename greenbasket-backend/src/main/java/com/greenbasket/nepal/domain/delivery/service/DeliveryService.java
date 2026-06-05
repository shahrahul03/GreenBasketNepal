package com.greenbasket.nepal.domain.delivery.service;

import com.greenbasket.nepal.common.dto.PagedResponse;
import com.greenbasket.nepal.domain.delivery.dto.*;

import java.util.List;

public interface DeliveryService {

    DeliveryResponse assignDelivery(AssignDeliveryRequest request);

    DeliveryResponse acceptDelivery(Long deliveryId, Long partnerId);

    DeliveryResponse updateStatus(Long deliveryId, Long partnerId, DeliveryStatusUpdateRequest request);

    DeliveryResponse getDeliveryById(Long deliveryId);

    DeliveryResponse getDeliveryByOrderId(Long orderId);

    List<DeliveryResponse> getMyActiveDeliveries(Long partnerId);

    PagedResponse<DeliveryResponse> getMyDeliveryHistory(Long partnerId, DeliverySearchRequest request);

    PagedResponse<DeliveryResponse> getAllDeliveries(DeliverySearchRequest request);
}
