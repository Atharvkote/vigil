package com.vigilsense.analytics.dto;

import java.math.BigDecimal;
import java.util.Map;

public record SiteAnalyticsResponse(
        Long siteId,
        WeatherStats weather,
        CalibrationStats calibration
) {
    public record WeatherStats(
            int totalObservations,
            BigDecimal avgTemperatureC,
            BigDecimal avgHumidityPercent,
            BigDecimal maxWindSpeedMs,
            BigDecimal totalRainfallMm,
            int stormCount
    ) {}

    public record CalibrationStats(
            int totalRecommendations,
            Map<String, Integer> recommendationsByRiskLevel,
            Map<String, Integer> actionsCount,
            Map<String, Integer> recommendationsBySensor
    ) {}
}
