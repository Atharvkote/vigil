package com.vigilsense.calibration.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.vigilsense.calibration.entity.CalibrationRecommendation;

public interface CalibrationRecommendationRepository extends JpaRepository<CalibrationRecommendation, Long> {

    @Query("""
            SELECT r FROM CalibrationRecommendation r
            JOIN FETCH r.weatherRecord
            JOIN FETCH r.sensorProfile
            WHERE r.sensor.id = :sensorId
            ORDER BY r.createdAt DESC
            """)
    List<CalibrationRecommendation> findBySensorIdOrderByCreatedAtDesc(
            @Param("sensorId") Long sensorId, Pageable pageable);

    default Optional<CalibrationRecommendation> findLatestBySensorId(Long sensorId) {
        List<CalibrationRecommendation> result = findBySensorIdOrderByCreatedAtDesc(
                sensorId, Pageable.ofSize(1));
        return result.isEmpty() ? Optional.empty() : Optional.of(result.get(0));
    }

    @Query("""
            SELECT r FROM CalibrationRecommendation r
            JOIN FETCH r.weatherRecord
            JOIN FETCH r.sensorProfile
            WHERE r.sensor.id = :sensorId
            ORDER BY r.createdAt DESC
            """)
    List<CalibrationRecommendation> findAllBySensorIdOrderByCreatedAtDesc(@Param("sensorId") Long sensorId);
}
