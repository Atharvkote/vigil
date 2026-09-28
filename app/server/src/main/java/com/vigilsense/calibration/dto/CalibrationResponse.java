package com.vigilsense.calibration.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;

import com.vigilsense.calibration.entity.CalibrationRecommendation;

public record CalibrationResponse(
        Long id,
        Long sensorId,
        Long siteId,
        Long weatherRecordId,
        Long sensorProfileId,
        String riskLevel,
        String affectedParameter,
        BigDecimal currentValue,
        BigDecimal recommendedValue,
        BigDecimal recommendedMin,
        BigDecimal recommendedMax,
        String action,
        List<String> reasons,
        String profileVersion,
        String ruleVersion,
        String status,
        Instant createdAt,
        WeatherSnapshotDto weather,
        AiAnalysisDto aiAnalysis
) {

    public static CalibrationResponse from(CalibrationRecommendation entity, String aiSummary, String aiReasoning) {
        var wr = entity.getWeatherRecord();
        WeatherSnapshotDto weatherDto = new WeatherSnapshotDto(
                wr.getTemperatureC(),
                wr.getHumidityPercent(),
                wr.getRainfallMm(),
                wr.getWindSpeedMs(),
                wr.getWindGustMs(),
                wr.isStormCondition(),
                wr.getObservedAt());

        AiAnalysisDto aiDto = null;
        if (aiSummary != null || aiReasoning != null) {
            aiDto = new AiAnalysisDto(aiSummary, aiReasoning);
        }

        return new CalibrationResponse(
                entity.getId(),
                entity.getSensor().getId(),
                entity.getSite().getId(),
                entity.getWeatherRecord().getId(),
                entity.getSensorProfile().getId(),
                entity.getRiskLevel().name(),
                entity.getAffectedParameter(),
                entity.getCurrentValue(),
                entity.getRecommendedValue(),
                entity.getRecommendedMin(),
                entity.getRecommendedMax(),
                entity.getAction().name(),
                splitReasons(entity.getReasons()),
                entity.getProfileVersion(),
                entity.getRuleVersion(),
                entity.getStatus().name(),
                entity.getCreatedAt(),
                weatherDto,
                aiDto);
    }

    private static List<String> splitReasons(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split("\\|"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public record WeatherSnapshotDto(
            BigDecimal temperatureC,
            BigDecimal humidityPercent,
            BigDecimal rainfallMm,
            BigDecimal windSpeedMs,
            BigDecimal windGustMs,
            boolean stormCondition,
            Instant observedAt
    ) {
    }

    public record AiAnalysisDto(
            String summary,
            String reason
    ) {
    }
}
