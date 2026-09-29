package com.vigilsense.weather.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.vigilsense.weather.entity.WeatherRecord;

public interface WeatherRecordRepository extends JpaRepository<WeatherRecord, Long> {

    Optional<WeatherRecord> findFirstBySiteIdOrderByRetrievedAtDesc(Long siteId);

    List<WeatherRecord> findBySiteIdAndRetrievedAtBetweenOrderByObservedAtDesc(
            Long siteId,
            Instant from,
            Instant to);

    List<WeatherRecord> findBySiteIdOrderByObservedAtDesc(Long siteId);

    List<WeatherRecord> findTop20ByOrderByRetrievedAtDesc();
}
