package com.vigilsense.system.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.common.response.ApiResponse;
import com.vigilsense.system.dto.SystemAcknowledgementDto;
import com.vigilsense.system.dto.SystemLogDto;
import com.vigilsense.system.service.SystemService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/v1/system")
@Tag(name = "System", description = "System engine diagnostics, logs, and acknowledgements")
public class SystemController {

    private final SystemService systemService;

    public SystemController(SystemService systemService) {
        this.systemService = systemService;
    }

    @GetMapping("/acknowledgements")
    @Operation(summary = "Get third-party, API, and AI acknowledgements")
    public ApiResponse<List<SystemAcknowledgementDto>> getAcknowledgements() {
        return ApiResponse.ok(systemService.getAcknowledgements());
    }

    @GetMapping("/logs")
    @Operation(summary = "Get live system, rule engine, AI engine, and telemetry logs")
    public ApiResponse<List<SystemLogDto>> getSystemLogs() {
        return ApiResponse.ok(systemService.getSystemLogs());
    }
}
