package com.vigilsense.site.dto;

import java.math.BigDecimal;
import java.time.Instant;

import com.vigilsense.site.entity.Site;

public record SiteResponse(
        Long id,
        String name,
        String locationLabel,
        BigDecimal latitude,
        BigDecimal longitude,
        Instant createdAt,
        Instant updatedAt
) {

    public static SiteResponse from(Site site) {
        return new SiteResponse(
                site.getId(),
                site.getName(),
                site.getLocationLabel(),
                site.getLatitude(),
                site.getLongitude(),
                site.getCreatedAt(),
                site.getUpdatedAt());
    }
}
