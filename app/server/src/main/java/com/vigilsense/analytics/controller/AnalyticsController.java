package com.vigilsense.analytics.controller;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.analytics.dto.SiteAnalyticsResponse;
import com.vigilsense.analytics.dto.SiteReportResponse;
import com.vigilsense.analytics.service.AnalyticsService;
import com.vigilsense.common.response.ApiResponse;

@RestController
@RequestMapping("/api/v1/sites/{siteId}")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<SiteAnalyticsResponse>> getAnalytics(
            @PathVariable Long siteId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        
        SiteAnalyticsResponse response = analyticsService.getSiteAnalytics(siteId, from, to);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/reports")
    public ResponseEntity<ApiResponse<SiteReportResponse>> getReport(@PathVariable Long siteId) {
        SiteReportResponse response = analyticsService.getSiteReport(siteId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
