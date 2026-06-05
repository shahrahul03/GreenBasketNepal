package com.greenbasket.nepal.domain.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlaceOrderRequest {

    @NotBlank(message = "Delivery address is required")
    @Size(min = 10, max = 1000, message = "Delivery address must be between 10 and 1000 characters")
    private String deliveryAddress;

    @NotBlank(message = "Phone number is required")
    @Size(min = 7, max = 20, message = "Phone number must be between 7 and 20 characters")
    private String phone;

    @Size(max = 500, message = "Delivery notes must not exceed 500 characters")
    private String deliveryNotes;
}
