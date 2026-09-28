package com.vigilsense.calibration.entity;

/**
 * Lifecycle status of a calibration recommendation.
 * GENERATED → ACKNOWLEDGED → APPLIED (operator-driven, not automatic).
 */
public enum RecommendationStatus {
    GENERATED,
    ACKNOWLEDGED,
    APPLIED
}
