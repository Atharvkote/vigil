package com.vigilsense.sensor.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record SensorConfigurationResponse(
        Long parameterId,
        String parameterKey,
        String displayName,
        String unit,
        BigDecimal currentValue,
        Instant capturedAt
) {
}
