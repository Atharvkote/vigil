package com.vigilsense.weather.client;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import java.math.BigDecimal;

import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import com.vigilsense.common.exception.WeatherProviderException;
import com.vigilsense.weather.dto.FetchedObservation;
import com.vigilsense.weather.mapper.WeatherMapper;

class OpenMeteoClientTest {

    private MockRestServiceServer server;
    private OpenMeteoClient client;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://api.open-meteo.com")
                .messageConverters(converters -> converters.add(0, new MappingJackson2HttpMessageConverter()));
        server = MockRestServiceServer.bindTo(builder).build();
        client = new OpenMeteoClient(builder.build(), new WeatherMapper());
    }

    @Test
    void fetchMapsSuccessfulPayload() {
        server.expect(requestTo(Matchers.containsString("/v1/forecast")))
                .andRespond(withSuccess("""
                        {
                          "latitude": 19.07,
                          "longitude": 72.88,
                          "current": {
                            "time": "2026-09-27T10:15",
                            "temperature_2m": 31.4,
                            "relative_humidity_2m": 86,
                            "precipitation": 0.2,
                            "weather_code": 1,
                            "wind_speed_10m": 4.1,
                            "wind_gusts_10m": 6.0
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        FetchedObservation observation = client.fetch(new BigDecimal("19.07"), new BigDecimal("72.88"));

        assertThat(observation.temperatureC()).isEqualByComparingTo("31.4");
        assertThat(observation.partial()).isFalse();
        server.verify();
    }

    @Test
    void fetchWrapsHttpErrors() {
        server.expect(requestTo(Matchers.containsString("/v1/forecast")))
                .andRespond(withServerError());

        assertThatThrownBy(() -> client.fetch(new BigDecimal("19.07"), new BigDecimal("72.88")))
                .isInstanceOf(WeatherProviderException.class)
                .hasMessageContaining("HTTP 500");
    }

    @Test
    void fetchWrapsMalformedJson() {
        server.expect(requestTo(Matchers.containsString("/v1/forecast")))
                .andRespond(withSuccess("{not-json", MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> client.fetch(new BigDecimal("19.07"), new BigDecimal("72.88")))
                .isInstanceOf(WeatherProviderException.class)
                .hasMessageContaining("unreadable");
    }

    @Test
    void fetchAllowsPartialCurrentBlock() {
        server.expect(requestTo(Matchers.containsString("/v1/forecast")))
                .andRespond(withSuccess("""
                        {
                          "latitude": 19.07,
                          "longitude": 72.88,
                          "current": {
                            "time": "2026-09-27T10:15",
                            "temperature_2m": 18.0,
                            "weather_code": 3,
                            "wind_speed_10m": 2.0
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        FetchedObservation observation = client.fetch(new BigDecimal("19.07"), new BigDecimal("72.88"));

        assertThat(observation.partial()).isTrue();
        assertThat(observation.missingVariables()).contains("humidity", "rainfall");
    }
}
