package com.vigilsense.system.dto;

public record SystemAcknowledgementDto(
        String id,
        String name,
        String category,
        String provider,
        String license,
        String url,
        String description,
        String roleInVigilSense,
        String version
) {
}
