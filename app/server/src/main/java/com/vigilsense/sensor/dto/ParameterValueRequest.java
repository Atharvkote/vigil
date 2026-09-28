package com.vigilsense.sensor.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ParameterValueRequest(
        @NotBlank(message = "parameterKey is required")
        String parameterKey,

        @NotNull(message = "value is required")
        BigDecimal value
) {
}
