package com.greenbasket.nepal.domain.settings.dto;

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
public class SettingRequest {

    @NotBlank(message = "Setting key is required")
    @Size(max = 100, message = "Setting key must not exceed 100 characters")
    private String settingKey;

    @NotBlank(message = "Setting value is required")
    @Size(max = 500, message = "Setting value must not exceed 500 characters")
    private String settingValue;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
}
