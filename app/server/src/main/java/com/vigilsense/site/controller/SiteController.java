package com.vigilsense.site.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vigilsense.common.response.ApiResponse;
import com.vigilsense.site.dto.CreateSiteRequest;
import com.vigilsense.site.dto.SiteResponse;
import com.vigilsense.site.dto.UpdateSiteRequest;
import com.vigilsense.site.service.SiteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/sites")
@Tag(name = "Sites", description = "Monitored site identity and geographic coordinates")
public class SiteController {

    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @GetMapping
    @Operation(summary = "List sites")
    public ApiResponse<List<SiteResponse>> listSites() {
        return ApiResponse.ok(siteService.listSites());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get site")
    public ApiResponse<SiteResponse> getSite(@PathVariable Long id) {
        return ApiResponse.ok(siteService.getSite(id));
    }

    @PostMapping
    @Operation(summary = "Create site")
    public ResponseEntity<ApiResponse<SiteResponse>> createSite(@Valid @RequestBody CreateSiteRequest request) {
        SiteResponse created = siteService.createSite(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Site created", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update site")
    public ApiResponse<SiteResponse> updateSite(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSiteRequest request) {
        return ApiResponse.ok("Site updated", siteService.updateSite(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete site")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.noContent().build();
    }
}
