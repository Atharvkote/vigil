package com.vigilsense.analytics.dto;

import java.time.Instant;
import java.util.List;

public record SiteReportResponse(
        Long siteId,
        String siteName,
        Instant generatedAt,
        String timeRange,
        SiteAnalyticsResponse analyticsSummary,
        List<RecentWeather> recentWeather,
        List<RecentRecommendation> recentRecommendations
) {
    public record RecentWeather(
            Instant observedAt,
            String summary
    ) {}

    public record RecentRecommendation(
            Instant createdAt,
            String sensorName,
            String action,
            String parameter,
            String reason
    ) {}
}
