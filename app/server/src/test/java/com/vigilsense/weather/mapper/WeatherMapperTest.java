package com.vigilsense.weather.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;

import org.junit.jupiter.api.Test;

import com.vigilsense.weather.dto.FetchedObservation;
import com.vigilsense.weather.dto.OpenMeteoResponse;

class WeatherMapperTest {

    private final WeatherMapper mapper = new WeatherMapper();

    @Test
    void mapsCompleteObservationAndNormalizesStormFromWmoCode() {
        OpenMeteoResponse response = new OpenMeteoResponse(
                new BigDecimal("19.07"),
                new BigDecimal("72.88"),
                new OpenMeteoResponse.Current(
                        "2026-09-27T10:15",
                        new BigDecimal("31.4"),
                        new BigDecimal("86"),
                        new BigDecimal("8.2"),
                        95,
                        new BigDecimal("12.5"),
                        new BigDecimal("18.0")));

        FetchedObservation observation = mapper.fromOpenMeteo(response, java.time.Instant.parse("2026-09-27T10:16:00Z"));

        assertThat(observation.temperatureC()).isEqualByComparingTo("31.4");
        assertThat(observation.humidityPercent()).isEqualByComparingTo("86");
        assertThat(observation.rainfallMm()).isEqualByComparingTo("8.2");
        assertThat(observation.windSpeedMs()).isEqualByComparingTo("12.5");
        assertThat(observation.windGustMs()).isEqualByComparingTo("18.0");
        assertThat(observation.stormCondition()).isTrue();
        assertThat(observation.partial()).isFalse();
        assertThat(observation.source()).isEqualTo("open-meteo");
        assertThat(observation.observedAt()).isEqualTo(java.time.Instant.parse("2026-09-27T10:15:00Z"));
    }

    @Test
    void flagsPartialDataWhenRequiredVariablesMissing() {
        OpenMeteoResponse response = new OpenMeteoResponse(
                new BigDecimal("19.07"),
                new BigDecimal("72.88"),
                new OpenMeteoResponse.Current(
                        "2026-09-27T10:15",
                        new BigDecimal("20.0"),
                        null,
                        null,
                        1,
                        new BigDecimal("3.0"),
                        null));

        FetchedObservation observation = mapper.fromOpenMeteo(response, java.time.Instant.parse("2026-09-27T10:16:00Z"));

        assertThat(observation.partial()).isTrue();
        assertThat(observation.missingVariables()).contains("humidity", "rainfall");
        assertThat(observation.stormCondition()).isFalse();
    }

    @Test
    void rejectsMissingCurrentBlock() {
        assertThatThrownBy(() -> mapper.fromOpenMeteo(
                new OpenMeteoResponse(new BigDecimal("1"), new BigDecimal("2"), null),
                java.time.Instant.now()))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
