package com.vigilsense.sensor.entity;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.vigilsense.sensor_profile.entity.SensorProfile;
import com.vigilsense.site.entity.Site;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "sensors")
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "site_id", nullable = false)
    private Site site;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sensor_profile_id", nullable = false)
    private SensorProfile profile;

    @Column(nullable = false)
    private String name;

    private String manufacturer;

    private String model;

    @Column(name = "installation_zone")
    private String installationZone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private SensorStatus status = SensorStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "sensor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SensorConfiguration> configurations = new ArrayList<>();

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

    public Site getSite() {
        return site;
    }

    public void setSite(Site site) {
        this.site = site;
    }

    public SensorProfile getProfile() {
        return profile;
    }

    public void setProfile(SensorProfile profile) {
        this.profile = profile;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getManufacturer() {
        return manufacturer;
    }

    public void setManufacturer(String manufacturer) {
        this.manufacturer = manufacturer;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getInstallationZone() {
        return installationZone;
    }

    public void setInstallationZone(String installationZone) {
        this.installationZone = installationZone;
    }

    public SensorStatus getStatus() {
        return status;
    }

    public void setStatus(SensorStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public List<SensorConfiguration> getConfigurations() {
        return configurations;
    }
}
