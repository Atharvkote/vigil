package com.vigilsense.analytics.controller;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.vigilsense.analytics.dto.SiteAnalyticsResponse;
import com.vigilsense.analytics.dto.SiteReportResponse;
import com.vigilsense.analytics.service.AnalyticsService;
import com.vigilsense.common.exception.GlobalExceptionHandler;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AnalyticsController.class)
@Import(GlobalExceptionHandler.class)
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AnalyticsService analyticsService;

    @Test
    void getAnalytics_returns200() throws Exception {
        SiteAnalyticsResponse response = new SiteAnalyticsResponse(
            1L,
            new SiteAnalyticsResponse.WeatherStats(10, BigDecimal.TEN, BigDecimal.TEN, BigDecimal.TEN, BigDecimal.TEN, 1),
            new SiteAnalyticsResponse.CalibrationStats(5, Map.of(), Map.of(), Map.of())
        );
        
        when(analyticsService.getSiteAnalytics(eq(1L), any(), any())).thenReturn(response);

        mockMvc.perform(get("/api/v1/sites/1/analytics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.siteId").value(1));
    }

    @Test
    void getReport_returns200() throws Exception {
        SiteReportResponse response = new SiteReportResponse(
            1L, "Site", Instant.now(), "Range", null, List.of(), List.of()
        );
        
        when(analyticsService.getSiteReport(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/sites/1/reports"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.siteId").value(1));
    }
}
