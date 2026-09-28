package com.vigilsense.weather.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.vigilsense.common.exception.GlobalExceptionHandler;
import com.vigilsense.common.exception.WeatherProviderException;
import com.vigilsense.weather.dto.WeatherResponse;
import com.vigilsense.weather.service.WeatherService;

@WebMvcTest(WeatherController.class)
@Import(GlobalExceptionHandler.class)
class WeatherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private WeatherService weatherService;

    @Test
    void currentReturnsStoredWeather() throws Exception {
        when(weatherService.current(1L)).thenReturn(sample(false));

        mockMvc.perform(get("/api/v1/sites/1/weather/current"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.temperatureC").value(31.4))
                .andExpect(jsonPath("$.data.stale").value(false));
    }

    @Test
    void refreshReturns503WhenProviderFails() throws Exception {
        when(weatherService.refresh(1L))
                .thenThrow(new WeatherProviderException("Weather provider timeout or connection failure"));

        mockMvc.perform(post("/api/v1/sites/1/weather/refresh"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("timeout")));
    }

    @Test
    void historyReturnsList() throws Exception {
        when(weatherService.history(1L, null, null)).thenReturn(List.of(sample(true)));

        mockMvc.perform(get("/api/v1/sites/1/weather/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].stale").value(true));
    }

    private static WeatherResponse sample(boolean stale) {
        return new WeatherResponse(
                42L,
                1L,
                new BigDecimal("19.076"),
                new BigDecimal("72.8777"),
                new BigDecimal("31.4"),
                new BigDecimal("86"),
                new BigDecimal("8.2"),
                new BigDecimal("12.5"),
                new BigDecimal("18.0"),
                1,
                false,
                Instant.parse("2026-09-27T10:15:00Z"),
                Instant.parse("2026-09-27T10:16:00Z"),
                "open-meteo",
                false,
                List.of(),
                stale,
                "temperature=C,humidity=percent,rainfall=mm,wind=m/s");
    }
}
