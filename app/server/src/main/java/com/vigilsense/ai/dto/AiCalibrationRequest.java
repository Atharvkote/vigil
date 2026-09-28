package com.vigilsense.ai.dto;

import java.math.BigDecimal;

public record AiCalibrationRequest(
        String sensorType,
        String manufacturer,
        String model,
        BigDecimal windSpeed,
        BigDecimal rainfall,
        BigDecimal temperature,
        BigDecimal humidity,
        String weatherCondition,
        String parameter,
        BigDecimal currentValue,
        String action,
        String riskLevel,
        String recommendedRange
) {
}
