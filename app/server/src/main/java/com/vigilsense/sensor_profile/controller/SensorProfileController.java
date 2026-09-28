package com.vigilsense.sensor_profile.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.common.response.ApiResponse;
import com.vigilsense.sensor_profile.dto.SensorProfileResponse;
import com.vigilsense.sensor_profile.service.SensorProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/sensor-profiles")
@Tag(name = "Sensor profiles", description = "Supported parameters, units, ranges, and weather factors per sensor type")
public class SensorProfileController {

    private final SensorProfileService sensorProfileService;

    public SensorProfileController(SensorProfileService sensorProfileService) {
        this.sensorProfileService = sensorProfileService;
    }

    @GetMapping
    @Operation(summary = "List active sensor profiles")
    public ApiResponse<List<SensorProfileResponse>> listProfiles() {
        return ApiResponse.ok(sensorProfileService.listProfiles());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get sensor profile with parameters")
    public ApiResponse<SensorProfileResponse> getProfile(@PathVariable Long id) {
        return ApiResponse.ok(sensorProfileService.getProfile(id));
    }
}
