package com.vigilsense.calibration.entity;

import java.math.BigDecimal;
import java.time.Instant;

import com.vigilsense.calibration.rule.CalibrationAction;
import com.vigilsense.calibration.rule.RiskLevel;
import com.vigilsense.sensor.entity.Sensor;
import com.vigilsense.sensor_profile.entity.SensorProfile;
import com.vigilsense.site.entity.Site;
import com.vigilsense.weather.entity.WeatherRecord;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "calibration_recommendations")
public class CalibrationRecommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sensor_id", nullable = false)
    private Sensor sensor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "weather_record_id", nullable = false)
    private WeatherRecord weatherRecord;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sensor_profile_id", nullable = false)
    private SensorProfile sensorProfile;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level", nullable = false, length = 16)
    private RiskLevel riskLevel;

    @Column(name = "affected_parameter", length = 64)
    private String affectedParameter;

    @Column(name = "current_value", precision = 12, scale = 4)
    private BigDecimal currentValue;

    @Column(name = "recommended_value", precision = 12, scale = 4)
    private BigDecimal recommendedValue;

    @Column(name = "recommended_min", precision = 12, scale = 4)
    private BigDecimal recommendedMin;

    @Column(name = "recommended_max", precision = 12, scale = 4)
    private BigDecimal recommendedMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CalibrationAction action;

    @Column(nullable = false, length = 2000)
    private String reasons;

    @Column(name = "profile_version", nullable = false, length = 32)
    private String profileVersion;

    @Column(name = "rule_version", nullable = false, length = 32)
    private String ruleVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private RecommendationStatus status = RecommendationStatus.GENERATED;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    // --- Getters and setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Sensor getSensor() {
        return sensor;
    }

    public void setSensor(Sensor sensor) {
        this.sensor = sensor;
    }

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public WeatherRecord getWeatherRecord() {
        return weatherRecord;
    }

    public void setWeatherRecord(WeatherRecord weatherRecord) {
        this.weatherRecord = weatherRecord;
    }

    public SensorProfile getSensorProfile() {
        return sensorProfile;
    }

    public void setSensorProfile(SensorProfile sensorProfile) {
        this.sensorProfile = sensorProfile;
    }

    public RiskLevel getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(RiskLevel riskLevel) {
        this.riskLevel = riskLevel;
    }

    public String getAffectedParameter() {
        return affectedParameter;
    }

    public void setAffectedParameter(String affectedParameter) {
        this.affectedParameter = affectedParameter;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public BigDecimal getRecommendedValue() {
        return recommendedValue;
    }

    public void setRecommendedValue(BigDecimal recommendedValue) {
        this.recommendedValue = recommendedValue;
    }

    public BigDecimal getRecommendedMin() {
        return recommendedMin;
    }

    public void setRecommendedMin(BigDecimal recommendedMin) {
        this.recommendedMin = recommendedMin;
    }

    public BigDecimal getRecommendedMax() {
        return recommendedMax;
    }

    public void setRecommendedMax(BigDecimal recommendedMax) {
        this.recommendedMax = recommendedMax;
    }

    public CalibrationAction getAction() {
        return action;
    }

    public void setAction(CalibrationAction action) {
        this.action = action;
    }

    public String getReasons() {
        return reasons;
    }

    public void setReasons(String reasons) {
        this.reasons = reasons;
    }

    public String getProfileVersion() {
        return profileVersion;
    }

    public void setProfileVersion(String profileVersion) {
        this.profileVersion = profileVersion;
    }

    public String getRuleVersion() {
        return ruleVersion;
    }

    public void setRuleVersion(String ruleVersion) {
        this.ruleVersion = ruleVersion;
    }

    public RecommendationStatus getStatus() {
        return status;
    }

    public void setStatus(RecommendationStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
