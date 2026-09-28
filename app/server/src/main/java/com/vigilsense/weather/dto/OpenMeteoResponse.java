package com.vigilsense.weather.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record OpenMeteoResponse(
        java.math.BigDecimal latitude,
        java.math.BigDecimal longitude,
        Current current
) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Current(
            String time,
            java.math.BigDecimal temperature_2m,
            java.math.BigDecimal relative_humidity_2m,
            java.math.BigDecimal precipitation,
            Integer weather_code,
            java.math.BigDecimal wind_speed_10m,
            java.math.BigDecimal wind_gusts_10m
    ) {
    }
}
