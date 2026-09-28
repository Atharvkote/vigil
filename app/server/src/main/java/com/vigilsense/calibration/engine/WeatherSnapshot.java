package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.time.Instant;

public record WeatherSnapshot(
        Long weatherRecordId,
        BigDecimal temperatureC,
        BigDecimal humidityPercent,
        BigDecimal rainfallMm,
        BigDecimal windSpeedMs,
        BigDecimal windGustMs,
        Integer weatherCode,
        boolean stormCondition,
        Instant observedAt,
        Instant retrievedAt,
        boolean partial
) {
}
