package com.vigilsense.sensor.dto;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

import com.vigilsense.sensor.entity.Sensor;
import com.vigilsense.sensor.entity.SensorStatus;

public record SensorResponse(
        Long id,
        Long siteId,
        Long sensorProfileId,
        String profileCode,
        String profileVersion,
        String name,
        String manufacturer,
        String model,
        String installationZone,
        SensorStatus status,
        List<SensorConfigurationResponse> configuration,
        Instant createdAt,
        Instant updatedAt
) {

    public static SensorResponse from(Sensor sensor) {
        List<SensorConfigurationResponse> configuration = sensor.getConfigurations().stream()
                .sorted(Comparator.comparing(item -> item.getParameter().getSortOrder()))
                .map(item -> new SensorConfigurationResponse(
                        item.getParameter().getId(),
                        item.getParameter().getParameterKey(),
                        item.getParameter().getDisplayName(),
                        item.getParameter().getUnit(),
                        item.getCurrentValue(),
                        item.getCapturedAt()))
                .toList();
        return new SensorResponse(
                sensor.getId(),
                sensor.getSite().getId(),
                sensor.getProfile().getId(),
                sensor.getProfile().getCode(),
                sensor.getProfile().getProfileVersion(),
                sensor.getName(),
                sensor.getManufacturer(),
                sensor.getModel(),
                sensor.getInstallationZone(),
                sensor.getStatus(),
                configuration,
                sensor.getCreatedAt(),
                sensor.getUpdatedAt());
    }
}
