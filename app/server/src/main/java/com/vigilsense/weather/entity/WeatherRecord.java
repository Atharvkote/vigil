package com.vigilsense.weather.entity;

import java.math.BigDecimal;
import java.time.Instant;

import com.vigilsense.site.entity.Site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "weather_records")
public class WeatherRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 11, scale = 7)
    private BigDecimal longitude;

    @Column(name = "temperature_c", precision = 6, scale = 2)
    private BigDecimal temperatureC;

    @Column(name = "humidity_percent", precision = 5, scale = 2)
    private BigDecimal humidityPercent;

    @Column(name = "rainfall_mm", precision = 8, scale = 2)
    private BigDecimal rainfallMm;

    @Column(name = "wind_speed_ms", precision = 6, scale = 2)
    private BigDecimal windSpeedMs;

    @Column(name = "wind_gust_ms", precision = 6, scale = 2)
    private BigDecimal windGustMs;

    @Column(name = "weather_code")
    private Integer weatherCode;

    @Column(name = "storm_condition", nullable = false)
    private boolean stormCondition;

    @Column(name = "observed_at")
    private Instant observedAt;

    @Column(name = "retrieved_at", nullable = false)
    private Instant retrievedAt;

    @Column(nullable = false, length = 64)
    private String source;

    @Column(nullable = false)
    private boolean partial;

    @Column(name = "missing_variables", length = 500)
    private String missingVariables;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public BigDecimal getTemperatureC() {
        return temperatureC;
    }

    public void setTemperatureC(BigDecimal temperatureC) {
        this.temperatureC = temperatureC;
    }

    public BigDecimal getHumidityPercent() {
        return humidityPercent;
    }

    public void setHumidityPercent(BigDecimal humidityPercent) {
        this.humidityPercent = humidityPercent;
    }

    public BigDecimal getRainfallMm() {
        return rainfallMm;
    }

    public void setRainfallMm(BigDecimal rainfallMm) {
        this.rainfallMm = rainfallMm;
    }

    public BigDecimal getWindSpeedMs() {
        return windSpeedMs;
    }

    public void setWindSpeedMs(BigDecimal windSpeedMs) {
        this.windSpeedMs = windSpeedMs;
    }

    public BigDecimal getWindGustMs() {
        return windGustMs;
    }

    public void setWindGustMs(BigDecimal windGustMs) {
        this.windGustMs = windGustMs;
    }

    public Integer getWeatherCode() {
        return weatherCode;
    }

    public void setWeatherCode(Integer weatherCode) {
        this.weatherCode = weatherCode;
    }

    public boolean isStormCondition() {
        return stormCondition;
    }

    public void setStormCondition(boolean stormCondition) {
        this.stormCondition = stormCondition;
    }

    public Instant getObservedAt() {
        return observedAt;
    }

    public void setObservedAt(Instant observedAt) {
        this.observedAt = observedAt;
    }

    public Instant getRetrievedAt() {
        return retrievedAt;
    }

    public void setRetrievedAt(Instant retrievedAt) {
        this.retrievedAt = retrievedAt;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public boolean isPartial() {
        return partial;
    }

    public void setPartial(boolean partial) {
        this.partial = partial;
    }

    public String getMissingVariables() {
        return missingVariables;
    }

    public void setMissingVariables(String missingVariables) {
        this.missingVariables = missingVariables;
    }
}
