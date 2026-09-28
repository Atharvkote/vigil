package com.vigilsense.weather.client;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import com.vigilsense.common.exception.WeatherProviderException;
import com.vigilsense.weather.dto.FetchedObservation;
import com.vigilsense.weather.dto.OpenMeteoResponse;
import com.vigilsense.weather.mapper.WeatherMapper;

@Component
public class OpenMeteoClient implements WeatherClient {

    private final RestClient restClient;
    private final WeatherMapper weatherMapper;

    public OpenMeteoClient(RestClient openMeteoRestClient, WeatherMapper weatherMapper) {
        this.restClient = openMeteoRestClient;
        this.weatherMapper = weatherMapper;
    }

    @Override
    @io.github.resilience4j.retry.annotation.Retry(name = "weatherApi")
    @io.github.resilience4j.ratelimiter.annotation.RateLimiter(name = "weatherApi")
    @io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker(name = "weatherApi")
    public FetchedObservation fetch(BigDecimal latitude, BigDecimal longitude) {
        OpenMeteoResponse response;
        try {
            response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/forecast")
                            .queryParam("latitude", latitude)
                            .queryParam("longitude", longitude)
                            .queryParam(
                                    "current",
                                    "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m")
                            .queryParam("temperature_unit", "celsius")
                            .queryParam("wind_speed_unit", "ms")
                            .queryParam("precipitation_unit", "mm")
                            .queryParam("timezone", "UTC")
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, httpResponse) -> {
                        throw new WeatherProviderException(
                                "Weather provider HTTP " + httpResponse.getStatusCode().value());
                    })
                    .body(OpenMeteoResponse.class);
        } catch (WeatherProviderException ex) {
            throw ex;
        } catch (ResourceAccessException ex) {
            throw new WeatherProviderException("Weather provider timeout or connection failure", ex);
        } catch (RuntimeException ex) {
            throw new WeatherProviderException("Weather provider returned an unreadable response", ex);
        }
        try {
            return weatherMapper.fromOpenMeteo(response, Instant.now());
        } catch (IllegalArgumentException ex) {
            throw new WeatherProviderException(ex.getMessage(), ex);
        }
    }
}
