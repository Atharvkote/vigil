package com.vigilsense.calibration.entity;

import java.math.BigDecimal;

import com.vigilsense.calibration.rule.CalibrationAction;
import com.vigilsense.calibration.rule.RuleOperator;
import com.vigilsense.calibration.rule.WeatherFactor;
import com.vigilsense.sensor_profile.entity.SensorProfile;

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
import jakarta.persistence.Table;

@Entity
@Table(name = "calibration_rules")
public class CalibrationRuleEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sensor_profile_id", nullable = false)
    private SensorProfile profile;

    @Enumerated(EnumType.STRING)
    @Column(name = "weather_factor", nullable = false, length = 32)
    private WeatherFactor weatherFactor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private RuleOperator operator;

    @Column(precision = 12, scale = 4)
    private BigDecimal threshold;

    @Column(name = "parameter_key", nullable = false, length = 64)
    private String parameterKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private CalibrationAction action;

    @Column(name = "target_value", precision = 12, scale = 4)
    private BigDecimal targetValue;

    @Column(name = "adjustment_value", precision = 12, scale = 4)
    private BigDecimal adjustmentValue;

    @Column(nullable = false)
    private int priority;

    @Column(nullable = false, length = 500)
    private String explanation;

    @Column(name = "rule_version", nullable = false, length = 32)
    private String ruleVersion;

    @Column(nullable = false)
    private boolean active = true;

    public Long getId() {
        return id;
    }

    public SensorProfile getProfile() {
        return profile;
    }

    public WeatherFactor getWeatherFactor() {
        return weatherFactor;
    }

    public RuleOperator getOperator() {
        return operator;
    }

    public BigDecimal getThreshold() {
        return threshold;
    }

    public String getParameterKey() {
        return parameterKey;
    }

    public CalibrationAction getAction() {
        return action;
    }

    public BigDecimal getTargetValue() {
        return targetValue;
    }

    public BigDecimal getAdjustmentValue() {
        return adjustmentValue;
    }

    public int getPriority() {
        return priority;
    }

    public String getExplanation() {
        return explanation;
    }

    public String getRuleVersion() {
        return ruleVersion;
    }

    public boolean isActive() {
        return active;
    }
}
