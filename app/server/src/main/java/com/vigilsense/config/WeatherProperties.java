package com.vigilsense.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vigilsense.weather")
public class WeatherProperties {

    private String baseUrl = "https://api.open-meteo.com";
    private Duration connectTimeout = Duration.ofSeconds(5);
    private Duration readTimeout = Duration.ofSeconds(10);
    private Duration staleAfter = Duration.ofMinutes(30);

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public Duration getConnectTimeout() {
        return connectTimeout;
    }

    public void setConnectTimeout(Duration connectTimeout) {
        this.connectTimeout = connectTimeout;
    }

    public Duration getReadTimeout() {
        return readTimeout;
    }

    public void setReadTimeout(Duration readTimeout) {
        this.readTimeout = readTimeout;
    }

    public Duration getStaleAfter() {
        return staleAfter;
    }

    public void setStaleAfter(Duration staleAfter) {
        this.staleAfter = staleAfter;
    }
}
