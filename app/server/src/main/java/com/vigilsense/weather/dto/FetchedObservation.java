package com.vigilsense.weather.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record FetchedObservation(
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal temperatureC,
        BigDecimal humidityPercent,
        BigDecimal rainfallMm,
        BigDecimal windSpeedMs,
        BigDecimal windGustMs,
        Integer weatherCode,
        boolean stormCondition,
        Instant observedAt,
        Instant retrievedAt,
        String source,
        boolean partial,
        List<String> missingVariables
) {
}
