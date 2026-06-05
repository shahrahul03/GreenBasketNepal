package com.greenbasket.nepal.domain.user.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
    private String fullName;

    @Pattern(regexp = "^(\\+977-?)?9[78]\\d{8}$", message = "Phone number must be a valid Nepali number")
    private String phone;

    @Size(max = 512, message = "Avatar URL must not exceed 512 characters")
    private String avatarUrl;
}
