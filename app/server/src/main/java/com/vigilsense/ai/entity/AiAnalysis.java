package com.vigilsense.ai.entity;

import java.time.Instant;

import com.vigilsense.calibration.entity.CalibrationRecommendation;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "ai_analysis")
public class AiAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recommendation_id", nullable = false)
    private CalibrationRecommendation recommendation;

    @Column(name = "model_provider", nullable = false, length = 64)
    private String modelProvider;

    @Column(name = "model_name", nullable = false, length = 64)
    private String modelName;

    @Column(name = "prompt_version", nullable = false, length = 32)
    private String promptVersion;

    @Column(name = "response_summary", nullable = false, length = 500)
    private String responseSummary;

    @Column(name = "reasoning_summary", nullable = false, length = 2000)
    private String reasoningSummary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public AiAnalysis() {
    }

    public AiAnalysis(CalibrationRecommendation recommendation, String modelProvider, String modelName, String promptVersion, String responseSummary, String reasoningSummary) {
        this.recommendation = recommendation;
        this.modelProvider = modelProvider;
        this.modelName = modelName;
        this.promptVersion = promptVersion;
        this.responseSummary = responseSummary;
        this.reasoningSummary = reasoningSummary;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CalibrationRecommendation getRecommendation() { return recommendation; }
    public void setRecommendation(CalibrationRecommendation recommendation) { this.recommendation = recommendation; }
    public String getModelProvider() { return modelProvider; }
    public void setModelProvider(String modelProvider) { this.modelProvider = modelProvider; }
    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }
    public String getPromptVersion() { return promptVersion; }
    public void setPromptVersion(String promptVersion) { this.promptVersion = promptVersion; }
    public String getResponseSummary() { return responseSummary; }
    public void setResponseSummary(String responseSummary) { this.responseSummary = responseSummary; }
    public String getReasoningSummary() { return reasoningSummary; }
    public void setReasoningSummary(String reasoningSummary) { this.reasoningSummary = reasoningSummary; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
