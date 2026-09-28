package com.vigilsense.sensor.dto;

import java.util.List;

import com.vigilsense.sensor.entity.SensorStatus;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateSensorRequest(
        @NotBlank(message = "name is required")
        @Size(max = 255)
        String name,

        @NotNull(message = "sensorProfileId is required")
        Long sensorProfileId,

        @Size(max = 255)
        String manufacturer,

        @Size(max = 255)
        String model,

        @Size(max = 255)
        String installationZone,

        SensorStatus status,

        @Valid
        List<ParameterValueRequest> configuration
) {
}
