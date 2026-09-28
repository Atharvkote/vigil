package com.vigilsense.weather.controller;

import java.time.Instant;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.common.response.ApiResponse;
import com.vigilsense.weather.dto.WeatherResponse;
import com.vigilsense.weather.service.WeatherService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/sites/{siteId}/weather")
@Tag(name = "Weather", description = "Site weather retrieval and history. Does not produce calibration recommendations.")
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping("/current")
    @Operation(summary = "Get the latest stored weather for a site")
    public ApiResponse<WeatherResponse> current(@PathVariable Long siteId) {
        return ApiResponse.ok(weatherService.current(siteId));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Fetch live weather for the site coordinates and persist it")
    public ApiResponse<WeatherResponse> refresh(@PathVariable Long siteId) {
        return ApiResponse.ok("Weather refreshed", weatherService.refresh(siteId));
    }

    @GetMapping("/history")
    @Operation(summary = "Get stored weather history for a site")
    public ApiResponse<List<WeatherResponse>> history(
            @PathVariable Long siteId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
        return ApiResponse.ok(weatherService.history(siteId, from, to));
    }
}
