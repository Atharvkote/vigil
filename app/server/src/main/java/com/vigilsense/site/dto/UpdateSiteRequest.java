package com.vigilsense.site.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateSiteRequest(
        @NotBlank(message = "name is required")
        @Size(max = 255)
        String name,

        @Size(max = 500)
        String locationLabel,

        @NotNull(message = "latitude is required")
        @DecimalMin(value = "-90.0", message = "latitude must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "latitude must be between -90 and 90")
        BigDecimal latitude,

        @NotNull(message = "longitude is required")
        @DecimalMin(value = "-180.0", message = "longitude must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "longitude must be between -180 and 180")
        BigDecimal longitude
) {
}
