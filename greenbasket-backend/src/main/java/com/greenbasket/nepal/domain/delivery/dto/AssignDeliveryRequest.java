package com.greenbasket.nepal.domain.delivery.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignDeliveryRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotNull(message = "Delivery partner ID is required")
    private Long deliveryPartnerId;
}
