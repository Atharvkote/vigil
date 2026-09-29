package com.vigilsense.system.dto;

import java.time.Instant;
import java.util.Map;

public record SystemLogDto(
        String id,
        Instant timestamp,
        String subsystem,
        String level,
        String source,
        String siteName,
        String sensorName,
        String message,
        String details,
        Map<String, Object> metadata
) {
}
