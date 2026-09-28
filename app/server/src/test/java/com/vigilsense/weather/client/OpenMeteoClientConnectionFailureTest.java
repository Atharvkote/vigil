package com.vigilsense.weather.client;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import com.vigilsense.common.exception.WeatherProviderException;
import com.vigilsense.weather.mapper.WeatherMapper;

class OpenMeteoClientConnectionFailureTest {

    @Test
    void wrapsConnectionFailure() {
        HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofMillis(200)).build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofMillis(200));
        RestClient restClient = RestClient.builder()
                .baseUrl("http://127.0.0.1:1")
                .requestFactory(factory)
                .build();
        OpenMeteoClient client = new OpenMeteoClient(restClient, new WeatherMapper());

        assertThatThrownBy(() -> client.fetch(new BigDecimal("19.07"), new BigDecimal("72.88")))
                .isInstanceOf(WeatherProviderException.class)
                .hasMessageContaining("timeout or connection");
    }
}
