package com.vigilsense.common.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.common.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Health", description = "Application liveness")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.ok(Map.of("status", "UP"));
    }
}
