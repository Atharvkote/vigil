package com.vigilsense.weather.mapper;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Component;

import com.vigilsense.weather.dto.FetchedObservation;
import com.vigilsense.weather.dto.OpenMeteoResponse;

@Component
public class WeatherMapper {

    static final Set<Integer> THUNDERSTORM_CODES = Set.of(95, 96, 99);
    static final String SOURCE_OPEN_METEO = "open-meteo";

    public FetchedObservation fromOpenMeteo(OpenMeteoResponse response, Instant retrievedAt) {
        if (response == null || response.current() == null) {
            throw new IllegalArgumentException("Weather provider returned no current observation");
        }
        OpenMeteoResponse.Current current = response.current();
        List<String> missing = new ArrayList<>();
        if (current.temperature_2m() == null) {
            missing.add("temperature");
        }
        if (current.relative_humidity_2m() == null) {
            missing.add("humidity");
        }
        if (current.precipitation() == null) {
            missing.add("rainfall");
        }
        if (current.wind_speed_10m() == null) {
            missing.add("windSpeed");
        }
        if (current.weather_code() == null) {
            missing.add("weatherCode");
        }
        Instant observedAt = parseObservationTime(current.time());
        if (observedAt == null) {
            missing.add("observedAt");
        }
        boolean storm = current.weather_code() != null && THUNDERSTORM_CODES.contains(current.weather_code());
        return new FetchedObservation(
                response.latitude(),
                response.longitude(),
                current.temperature_2m(),
                current.relative_humidity_2m(),
                current.precipitation(),
                current.wind_speed_10m(),
                current.wind_gusts_10m(),
                current.weather_code(),
                storm,
                observedAt,
                retrievedAt,
                SOURCE_OPEN_METEO,
                !missing.isEmpty(),
                List.copyOf(missing));
    }

    private static Instant parseObservationTime(String time) {
        if (time == null || time.isBlank()) {
            return null;
        }
        try {
            if (time.endsWith("Z") || time.contains("+")) {
                return Instant.parse(time);
            }
            return LocalDateTime.parse(time).toInstant(ZoneOffset.UTC);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    public static boolean isThunderstorm(Integer weatherCode) {
        return weatherCode != null && THUNDERSTORM_CODES.contains(weatherCode);
    }
}
