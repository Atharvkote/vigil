package com.vigilsense.weather.service;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.config.WeatherProperties;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;
import com.vigilsense.weather.client.WeatherClient;
import com.vigilsense.weather.dto.FetchedObservation;
import com.vigilsense.weather.dto.WeatherResponse;
import com.vigilsense.weather.entity.WeatherRecord;
import com.vigilsense.weather.repository.WeatherRecordRepository;

@Service
@Transactional(readOnly = true)
public class WeatherService {

    private final SiteRepository siteRepository;
    private final WeatherRecordRepository weatherRecordRepository;
    private final WeatherClient weatherClient;
    private final WeatherProperties weatherProperties;
    private final Clock clock;

    public WeatherService(
            SiteRepository siteRepository,
            WeatherRecordRepository weatherRecordRepository,
            WeatherClient weatherClient,
            WeatherProperties weatherProperties,
            Clock clock) {
        this.siteRepository = siteRepository;
        this.weatherRecordRepository = weatherRecordRepository;
        this.weatherClient = weatherClient;
        this.weatherProperties = weatherProperties;
        this.clock = clock;
    }

    public WeatherResponse current(Long siteId) {
        requireSite(siteId);
        WeatherRecord record = weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(siteId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No weather recorded for site " + siteId + ". POST /api/v1/sites/" + siteId
                                + "/weather/refresh to fetch live data."));
        return WeatherResponse.from(record, isStale(record));
    }

    public List<WeatherResponse> history(Long siteId, Instant from, Instant to) {
        requireSite(siteId);
        List<WeatherRecord> records;
        if (from != null && to != null) {
            records = weatherRecordRepository.findBySiteIdAndRetrievedAtBetweenOrderByObservedAtDesc(
                    siteId, from, to);
        } else {
            records = weatherRecordRepository.findBySiteIdOrderByObservedAtDesc(siteId);
        }
        return records.stream()
                .map(record -> WeatherResponse.from(record, isStale(record)))
                .toList();
    }

    @Transactional
    public WeatherResponse refresh(Long siteId) {
        Site site = requireSite(siteId);
        FetchedObservation observation = weatherClient.fetch(site.getLatitude(), site.getLongitude());
        WeatherRecord latest = weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(siteId).orElse(null);
        if (latest != null && sameObservation(latest, observation)) {
            return WeatherResponse.from(latest, isStale(latest));
        }
        WeatherRecord record = toEntity(site, observation);
        return WeatherResponse.from(weatherRecordRepository.save(record), false);
    }

    private boolean isStale(WeatherRecord record) {
        Instant retrievedAt = record.getRetrievedAt();
        if (retrievedAt == null) {
            return true;
        }
        return retrievedAt.plus(weatherProperties.getStaleAfter()).isBefore(clock.instant());
    }

    private static boolean sameObservation(WeatherRecord existing, FetchedObservation incoming) {
        if (existing.getObservedAt() == null || incoming.observedAt() == null) {
            return false;
        }
        return existing.getObservedAt().equals(incoming.observedAt())
                && existing.getSource().equals(incoming.source());
    }

    private static WeatherRecord toEntity(Site site, FetchedObservation observation) {
        WeatherRecord record = new WeatherRecord();
        record.setSite(site);
        record.setLatitude(observation.latitude() != null ? observation.latitude() : site.getLatitude());
        record.setLongitude(observation.longitude() != null ? observation.longitude() : site.getLongitude());
        record.setTemperatureC(observation.temperatureC());
        record.setHumidityPercent(observation.humidityPercent());
        record.setRainfallMm(observation.rainfallMm());
        record.setWindSpeedMs(observation.windSpeedMs());
        record.setWindGustMs(observation.windGustMs());
        record.setWeatherCode(observation.weatherCode());
        record.setStormCondition(observation.stormCondition());
        record.setObservedAt(observation.observedAt());
        record.setRetrievedAt(observation.retrievedAt());
        record.setSource(observation.source());
        record.setPartial(observation.partial());
        record.setMissingVariables(observation.missingVariables().isEmpty()
                ? null
                : String.join(",", observation.missingVariables()));
        return record;
    }

    private Site requireSite(Long siteId) {
        return siteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found: " + siteId));
    }
}
