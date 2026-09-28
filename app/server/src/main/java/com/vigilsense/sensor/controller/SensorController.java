package com.vigilsense.sensor.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.common.response.ApiResponse;
import com.vigilsense.sensor.dto.CreateSensorRequest;
import com.vigilsense.sensor.dto.SensorResponse;
import com.vigilsense.sensor.dto.UpdateSensorRequest;
import com.vigilsense.sensor.service.SensorService;
import com.vigilsense.sensor_profile.dto.SensorProfileResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Sensors", description = "Site sensors and profile-backed configuration")
public class SensorController {

    private final SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @GetMapping("/sites/{siteId}/sensors")
    @Operation(summary = "List sensors for a site")
    public ApiResponse<List<SensorResponse>> listBySite(@PathVariable Long siteId) {
        return ApiResponse.ok(sensorService.listBySite(siteId));
    }

    @PostMapping("/sites/{siteId}/sensors")
    @Operation(summary = "Register a sensor at a site")
    public ResponseEntity<ApiResponse<SensorResponse>> createSensor(
            @PathVariable Long siteId,
            @Valid @RequestBody CreateSensorRequest request) {
        SensorResponse created = sensorService.createSensor(siteId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Sensor created", created));
    }

    @GetMapping("/sensors/{id}")
    @Operation(summary = "Get sensor and current configuration")
    public ApiResponse<SensorResponse> getSensor(@PathVariable Long id) {
        return ApiResponse.ok(sensorService.getSensor(id));
    }

    @PutMapping("/sensors/{id}")
    @Operation(summary = "Update sensor and configuration")
    public ApiResponse<SensorResponse> updateSensor(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSensorRequest request) {
        return ApiResponse.ok("Sensor updated", sensorService.updateSensor(id, request));
    }

    @GetMapping("/sensors/{id}/profile")
    @Operation(summary = "Get the sensor profile that defines this sensor's parameters")
    public ApiResponse<SensorProfileResponse> getProfile(@PathVariable Long id) {
        return ApiResponse.ok(sensorService.getProfile(id));
    }
}
