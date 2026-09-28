package com.vigilsense.sensor_profile.dto;

import java.util.Arrays;
import java.util.List;

import com.vigilsense.sensor_profile.entity.SensorProfile;

public record SensorProfileResponse(
        Long id,
        String code,
        String name,
        String description,
        String manufacturerScope,
        String modelScope,
        String profileVersion,
        List<String> relevantWeatherFactors,
        boolean active,
        List<SensorParameterResponse> parameters
) {

    public static SensorProfileResponse from(SensorProfile profile) {
        return new SensorProfileResponse(
                profile.getId(),
                profile.getCode(),
                profile.getName(),
                profile.getDescription(),
                profile.getManufacturerScope(),
                profile.getModelScope(),
                profile.getProfileVersion(),
                splitFactors(profile.getRelevantWeatherFactors()),
                profile.isActive(),
                profile.getParameters().stream().map(SensorParameterResponse::from).toList());
    }

    private static List<String> splitFactors(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toList();
    }
}
