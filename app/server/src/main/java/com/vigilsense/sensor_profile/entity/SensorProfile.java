package com.vigilsense.sensor_profile.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "sensor_profiles")
public class SensorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(name = "manufacturer_scope")
    private String manufacturerScope;

    @Column(name = "model_scope")
    private String modelScope;

    @Column(name = "profile_version", nullable = false, length = 32)
    private String profileVersion;

    @Column(name = "relevant_weather_factors", nullable = false, length = 500)
    private String relevantWeatherFactors;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "profile")
    @OrderBy("sortOrder ASC")
    private List<SensorParameter> parameters = new ArrayList<>();

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getManufacturerScope() {
        return manufacturerScope;
    }

    public void setManufacturerScope(String manufacturerScope) {
        this.manufacturerScope = manufacturerScope;
    }

    public String getModelScope() {
        return modelScope;
    }

    public void setModelScope(String modelScope) {
        this.modelScope = modelScope;
    }

    public String getProfileVersion() {
        return profileVersion;
    }

    public void setProfileVersion(String profileVersion) {
        this.profileVersion = profileVersion;
    }

    public String getRelevantWeatherFactors() {
        return relevantWeatherFactors;
    }

    public void setRelevantWeatherFactors(String relevantWeatherFactors) {
        this.relevantWeatherFactors = relevantWeatherFactors;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<SensorParameter> getParameters() {
        return parameters;
    }

    public void setParameters(List<SensorParameter> parameters) {
        this.parameters = parameters;
    }
}
