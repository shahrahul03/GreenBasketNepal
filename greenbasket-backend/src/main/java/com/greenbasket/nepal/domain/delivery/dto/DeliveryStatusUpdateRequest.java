package com.greenbasket.nepal.domain.delivery.dto;

import com.greenbasket.nepal.domain.delivery.entity.DeliveryStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private DeliveryStatus status;

    @Size(max = 500, message = "Delivery notes must not exceed 500 characters")
    private String deliveryNotes;

    @Size(max = 20, message = "Recipient phone must not exceed 20 characters")
    private String recipientPhone;
}
