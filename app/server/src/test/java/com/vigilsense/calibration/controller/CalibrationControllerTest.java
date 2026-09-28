package com.vigilsense.calibration.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.vigilsense.calibration.dto.CalibrationResponse;
import com.vigilsense.calibration.service.CalibrationService;
import com.vigilsense.common.exception.GlobalExceptionHandler;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CalibrationController.class)
@Import(GlobalExceptionHandler.class)
class CalibrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalibrationService calibrationService;

    @Test
    void getCurrent_returnsRecommendation() throws Exception {
        CalibrationResponse response = stubResponse();
        when(calibrationService.current(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/sensors/1/calibration/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sensorId").value(1))
                .andExpect(jsonPath("$.data.riskLevel").value("HIGH"))
                .andExpect(jsonPath("$.data.affectedParameter").value("sensitivity"))
                .andExpect(jsonPath("$.data.action").value("DECREASE"))
                .andExpect(jsonPath("$.data.reasons[0]").value("Storm detected"))
                .andExpect(jsonPath("$.data.profileVersion").value("1.0"))
                .andExpect(jsonPath("$.data.ruleVersion").value("1.0"))
                .andExpect(jsonPath("$.data.weather.stormCondition").value(true));
    }

    @Test
    void postEvaluate_returns201() throws Exception {
        CalibrationResponse response = stubResponse();
        when(calibrationService.evaluate(1L)).thenReturn(response);

        mockMvc.perform(post("/api/v1/sensors/1/calibration/evaluate"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sensorId").value(1));
    }

    @Test
    void getHistory_returnsList() throws Exception {
        CalibrationResponse response = stubResponse();
        when(calibrationService.history(1L)).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/sensors/1/calibration/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].sensorId").value(1));
    }

    private CalibrationResponse stubResponse() {
        return new CalibrationResponse(
                1L, 1L, 1L, 1L, 1L,
                "HIGH", "sensitivity",
                new BigDecimal("70"), new BigDecimal("40"),
                new BigDecimal("10"), new BigDecimal("100"),
                "DECREASE",
                List.of("Storm detected"),
                "1.0", "1.0",
                "GENERATED",
                Instant.now(),
                new CalibrationResponse.WeatherSnapshotDto(
                        new BigDecimal("15"), new BigDecimal("90"),
                        new BigDecimal("12"), new BigDecimal("18"),
                        new BigDecimal("25"), true, Instant.now()),
                null);
    }
}
