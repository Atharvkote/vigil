package com.vigilsense.site.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
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
import com.vigilsense.site.dto.CreateSiteRequest;
import com.vigilsense.site.dto.SiteResponse;
import com.vigilsense.site.dto.UpdateSiteRequest;
import com.vigilsense.site.service.SiteService;

@WebMvcTest(SiteController.class)
@Import(GlobalExceptionHandler.class)
class SiteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SiteService siteService;

    private final SiteResponse sample = new SiteResponse(
            1L,
            "Industrial Site A",
            "North fence",
            new BigDecimal("19.0760000"),
            new BigDecimal("72.8777000"),
            Instant.parse("2026-09-27T10:00:00Z"),
            Instant.parse("2026-09-27T10:00:00Z"));

    @Test
    void listSitesReturnsOk() throws Exception {
        when(siteService.listSites()).thenReturn(List.of(sample));

        mockMvc.perform(get("/api/v1/sites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].name").value("Industrial Site A"));
    }

    @Test
    void getSiteReturnsNotFound() throws Exception {
        when(siteService.getSite(42L)).thenThrow(new ResourceNotFoundException("Site not found: 42"));

        mockMvc.perform(get("/api/v1/sites/42"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Site not found: 42"));
    }

    @Test
    void createSiteRejectsInvalidLatitude() throws Exception {
        mockMvc.perform(post("/api/v1/sites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Bad Site",
                                  "locationLabel": "Nowhere",
                                  "latitude": 91,
                                  "longitude": 72.8
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.data.latitude").exists());
    }

    @Test
    void createSiteRejectsInvalidLongitude() throws Exception {
        mockMvc.perform(post("/api/v1/sites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Bad Site",
                                  "latitude": 19.0,
                                  "longitude": -181
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.longitude").exists());
    }

    @Test
    void createSiteReturnsCreated() throws Exception {
        when(siteService.createSite(any(CreateSiteRequest.class))).thenReturn(sample);

        mockMvc.perform(post("/api/v1/sites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Industrial Site A",
                                  "locationLabel": "North fence",
                                  "latitude": 19.076,
                                  "longitude": 72.8777
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.latitude").value(19.076));
    }

    @Test
    void updateSiteReturnsOk() throws Exception {
        when(siteService.updateSite(eq(1L), any(UpdateSiteRequest.class))).thenReturn(sample);

        mockMvc.perform(put("/api/v1/sites/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Industrial Site A",
                                  "locationLabel": "North fence",
                                  "latitude": 19.076,
                                  "longitude": 72.8777
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void deleteSiteReturnsNoContent() throws Exception {
        mockMvc.perform(delete("/api/v1/sites/1"))
                .andExpect(status().isNoContent());
        verify(siteService).deleteSite(1L);
    }

    @Test
    void deleteMissingSiteReturnsNotFound() throws Exception {
        doThrow(new ResourceNotFoundException("Site not found: 1")).when(siteService).deleteSite(1L);

        mockMvc.perform(delete("/api/v1/sites/1"))
                .andExpect(status().isNotFound());
    }
}
