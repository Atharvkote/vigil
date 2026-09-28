package com.vigilsense.sensorprofile.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.vigilsense.common.exception.GlobalExceptionHandler;
import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor_profile.controller.SensorProfileController;
import com.vigilsense.sensor_profile.dto.SensorParameterResponse;
import com.vigilsense.sensor_profile.dto.SensorProfileResponse;
import com.vigilsense.sensor_profile.service.SensorProfileService;

@WebMvcTest(SensorProfileController.class)
@Import(GlobalExceptionHandler.class)
class SensorProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SensorProfileService sensorProfileService;

    @Test
    void listProfilesReturnsOk() throws Exception {
        when(sensorProfileService.listProfiles()).thenReturn(List.of(fiberProfile()));

        mockMvc.perform(get("/api/v1/sensor-profiles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].code").value("FIBER_OPTIC_FENCE"))
                .andExpect(jsonPath("$.data[0].parameters[0].parameterKey").value("sensitivity"));
    }

    @Test
    void getProfileReturnsNotFound() throws Exception {
        when(sensorProfileService.getProfile(9L))
                .thenThrow(new ResourceNotFoundException("Sensor profile not found: 9"));

        mockMvc.perform(get("/api/v1/sensor-profiles/9"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getProfileIncludesParameters() throws Exception {
        when(sensorProfileService.getProfile(1L)).thenReturn(fiberProfile());

        mockMvc.perform(get("/api/v1/sensor-profiles/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.profileVersion").value("1.0"))
                .andExpect(jsonPath("$.data.parameters.length()").value(2));
    }

    private static SensorProfileResponse fiberProfile() {
        return new SensorProfileResponse(
                1L,
                "FIBER_OPTIC_FENCE",
                "Fiber-optic fence sensor",
                "demo",
                "Generic",
                "FO-FENCE-DEMO",
                "1.0",
                List.of("WIND_SPEED", "RAINFALL"),
                true,
                List.of(new SensorParameterResponse(
                        1L, "sensitivity", "Sensitivity", "percent", "DECIMAL",
                        BigDecimal.ZERO, new BigDecimal("100"), new BigDecimal("70"), 1),
                        new SensorParameterResponse(
                                2L, "alarm_threshold", "Alarm threshold", "percent", "DECIMAL",
                                BigDecimal.ZERO, new BigDecimal("100"), new BigDecimal("45"), 2)));
    }
}
