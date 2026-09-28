package com.vigilsense.weather.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import com.vigilsense.weather.entity.WeatherRecord;

public record WeatherResponse(
        Long id,
        Long siteId,
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
        List<String> missingVariables,
        boolean stale,
        String units
) {

    public static WeatherResponse from(WeatherRecord record, boolean stale) {
        return new WeatherResponse(
                record.getId(),
                record.getSite().getId(),
                record.getLatitude(),
                record.getLongitude(),
                record.getTemperatureC(),
                record.getHumidityPercent(),
                record.getRainfallMm(),
                record.getWindSpeedMs(),
                record.getWindGustMs(),
                record.getWeatherCode(),
                record.isStormCondition(),
                record.getObservedAt(),
                record.getRetrievedAt(),
                record.getSource(),
                record.isPartial(),
                split(record.getMissingVariables()),
                stale,
                "temperature=C,humidity=percent,rainfall=mm,wind=m/s");
    }

    private static List<String> split(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
}
