package com.vigilsense.sensor.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.vigilsense.common.exception.GlobalExceptionHandler;
import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor.dto.CreateSensorRequest;
import com.vigilsense.sensor.dto.SensorConfigurationResponse;
import com.vigilsense.sensor.dto.SensorResponse;
import com.vigilsense.sensor.dto.UpdateSensorRequest;
import com.vigilsense.sensor.entity.SensorStatus;
import com.vigilsense.sensor.service.SensorService;
import com.vigilsense.sensor_profile.dto.SensorParameterResponse;
import com.vigilsense.sensor_profile.dto.SensorProfileResponse;

@WebMvcTest(SensorController.class)
@Import(GlobalExceptionHandler.class)
class SensorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SensorService sensorService;

    @Test
    void createSensorReturnsCreated() throws Exception {
        when(sensorService.createSensor(eq(1L), any(CreateSensorRequest.class))).thenReturn(sampleSensor());

        mockMvc.perform(post("/api/v1/sites/1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "North Fence 01",
                                  "sensorProfileId": 10,
                                  "installationZone": "North",
                                  "status": "ACTIVE",
                                  "configuration": [
                                    { "parameterKey": "sensitivity", "value": 70 }
                                  ]
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("North Fence 01"))
                .andExpect(jsonPath("$.data.configuration[0].parameterKey").value("sensitivity"));
    }

    @Test
    void createSensorReturns400ForUnsupportedParameter() throws Exception {
        when(sensorService.createSensor(eq(1L), any(CreateSensorRequest.class)))
                .thenThrow(new IllegalArgumentException(
                        "Unsupported parameter(s) for profile FIBER_OPTIC_FENCE: detection_range. Supported: alarm_threshold, sensitivity"));

        mockMvc.perform(post("/api/v1/sites/1/sensors")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "North Fence 01",
                                  "sensorProfileId": 10,
                                  "configuration": [
                                    { "parameterKey": "detection_range", "value": 120 }
                                  ]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Unsupported parameter")));
    }

    @Test
    void getSensorReturnsNotFound() throws Exception {
        when(sensorService.getSensor(9L)).thenThrow(new ResourceNotFoundException("Sensor not found: 9"));

        mockMvc.perform(get("/api/v1/sensors/9"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateSensorReturnsOk() throws Exception {
        when(sensorService.updateSensor(eq(5L), any(UpdateSensorRequest.class))).thenReturn(sampleSensor());

        mockMvc.perform(put("/api/v1/sensors/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "North Fence 01",
                                  "status": "ACTIVE",
                                  "configuration": [
                                    { "parameterKey": "sensitivity", "value": 55 }
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getSensorProfileReturnsProfile() throws Exception {
        when(sensorService.getProfile(5L)).thenReturn(new SensorProfileResponse(
                10L,
                "FIBER_OPTIC_FENCE",
                "Fiber-optic fence sensor",
                "demo",
                "Generic",
                "FO-FENCE-DEMO",
                "1.0",
                List.of("WIND_SPEED"),
                true,
                List.of(new SensorParameterResponse(
                        100L, "sensitivity", "Sensitivity", "percent", "DECIMAL",
                        BigDecimal.ZERO, new BigDecimal("100"), new BigDecimal("70"), 1))));

        mockMvc.perform(get("/api/v1/sensors/5/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.code").value("FIBER_OPTIC_FENCE"));
    }

    private static SensorResponse sampleSensor() {
        return new SensorResponse(
                5L,
                1L,
                10L,
                "FIBER_OPTIC_FENCE",
                "1.0",
                "North Fence 01",
                "Acme",
                "FO-1",
                "North",
                SensorStatus.ACTIVE,
                List.of(new SensorConfigurationResponse(
                        100L, "sensitivity", "Sensitivity", "percent",
                        new BigDecimal("70"), Instant.parse("2026-09-27T10:00:00Z"))),
                Instant.parse("2026-09-27T10:00:00Z"),
                Instant.parse("2026-09-27T10:00:00Z"));
    }
}
