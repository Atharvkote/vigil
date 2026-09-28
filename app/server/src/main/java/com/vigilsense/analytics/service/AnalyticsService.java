package com.vigilsense.analytics.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vigilsense.analytics.dto.SiteAnalyticsResponse;
import com.vigilsense.analytics.dto.SiteAnalyticsResponse.CalibrationStats;
import com.vigilsense.analytics.dto.SiteAnalyticsResponse.WeatherStats;
import com.vigilsense.analytics.dto.SiteReportResponse;
import com.vigilsense.analytics.dto.SiteReportResponse.RecentRecommendation;
import com.vigilsense.analytics.dto.SiteReportResponse.RecentWeather;
import com.vigilsense.calibration.entity.CalibrationRecommendation;
import com.vigilsense.calibration.repository.CalibrationRecommendationRepository;
import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;
import com.vigilsense.weather.entity.WeatherRecord;
import com.vigilsense.weather.repository.WeatherRecordRepository;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final SiteRepository siteRepository;
    private final WeatherRecordRepository weatherRecordRepository;
    private final CalibrationRecommendationRepository recommendationRepository;

    public AnalyticsService(
            SiteRepository siteRepository,
            WeatherRecordRepository weatherRecordRepository,
            CalibrationRecommendationRepository recommendationRepository) {
        this.siteRepository = siteRepository;
        this.weatherRecordRepository = weatherRecordRepository;
        this.recommendationRepository = recommendationRepository;
    }

    public SiteAnalyticsResponse getSiteAnalytics(Long siteId, Instant from, Instant to) {
        requireSite(siteId);

        List<WeatherRecord> weatherRecords;
        if (from != null && to != null) {
            weatherRecords = weatherRecordRepository.findBySiteIdAndRetrievedAtBetweenOrderByObservedAtDesc(siteId, from, to);
        } else {
            weatherRecords = weatherRecordRepository.findBySiteIdOrderByObservedAtDesc(siteId);
        }

        // We could filter recommendations by date too, but we'll just get all for this basic version,
        // or filter them in memory if dates are provided.
        List<CalibrationRecommendation> allRecommendations = recommendationRepository.findAll().stream()
                .filter(r -> r.getSite().getId().equals(siteId))
                .filter(r -> {
                    if (from == null || to == null) return true;
                    Instant created = r.getCreatedAt();
                    return !created.isBefore(from) && !created.isAfter(to);
                })
                .toList();

        return new SiteAnalyticsResponse(
                siteId,
                buildWeatherStats(weatherRecords),
                buildCalibrationStats(allRecommendations)
        );
    }

    public SiteReportResponse getSiteReport(Long siteId) {
        Site site = requireSite(siteId);
        Instant now = Instant.now();
        Instant thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);

        SiteAnalyticsResponse analytics = getSiteAnalytics(siteId, thirtyDaysAgo, now);

        List<WeatherRecord> recentWeather = weatherRecordRepository
                .findBySiteIdAndRetrievedAtBetweenOrderByObservedAtDesc(siteId, thirtyDaysAgo, now).stream()
                .limit(10)
                .toList();

        List<CalibrationRecommendation> recentRecs = recommendationRepository.findAll().stream()
                .filter(r -> r.getSite().getId().equals(siteId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .toList();

        List<RecentWeather> weatherDtos = recentWeather.stream()
                .map(w -> new RecentWeather(w.getObservedAt(), 
                    String.format("Temp: %s C, Wind: %s m/s, Rain: %s mm%s", 
                        w.getTemperatureC(), w.getWindSpeedMs(), w.getRainfallMm(), 
                        w.isStormCondition() ? " (Storm)" : "")))
                .toList();

        List<RecentRecommendation> recDtos = recentRecs.stream()
                .map(r -> new RecentRecommendation(
                        r.getCreatedAt(),
                        r.getSensor().getName(),
                        r.getAction().name(),
                        r.getAffectedParameter(),
                        r.getReasons()))
                .toList();

        return new SiteReportResponse(
                siteId,
                site.getName(),
                now,
                "Last 30 Days",
                analytics,
                weatherDtos,
                recDtos
        );
    }

    private WeatherStats buildWeatherStats(List<WeatherRecord> records) {
        if (records.isEmpty()) {
            return new WeatherStats(0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0);
        }

        BigDecimal sumTemp = BigDecimal.ZERO;
        BigDecimal sumHum = BigDecimal.ZERO;
        BigDecimal maxWind = BigDecimal.ZERO;
        BigDecimal totalRain = BigDecimal.ZERO;
        int stormCount = 0;

        for (WeatherRecord r : records) {
            sumTemp = sumTemp.add(r.getTemperatureC());
            sumHum = sumHum.add(r.getHumidityPercent());
            totalRain = totalRain.add(r.getRainfallMm());
            if (r.getWindSpeedMs().compareTo(maxWind) > 0) {
                maxWind = r.getWindSpeedMs();
            }
            if (r.isStormCondition()) {
                stormCount++;
            }
        }

        int count = records.size();
        BigDecimal avgTemp = sumTemp.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
        BigDecimal avgHum = sumHum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);

        return new WeatherStats(count, avgTemp, avgHum, maxWind, totalRain, stormCount);
    }

    private CalibrationStats buildCalibrationStats(List<CalibrationRecommendation> recs) {
        Map<String, Integer> byRisk = new LinkedHashMap<>();
        Map<String, Integer> byAction = new LinkedHashMap<>();
        Map<String, Integer> bySensor = new LinkedHashMap<>();

        for (CalibrationRecommendation r : recs) {
            byRisk.merge(r.getRiskLevel().name(), 1, Integer::sum);
            byAction.merge(r.getAction().name(), 1, Integer::sum);
            bySensor.merge(r.getSensor().getName(), 1, Integer::sum);
        }

        return new CalibrationStats(recs.size(), byRisk, byAction, bySensor);
    }

    private Site requireSite(Long siteId) {
        return siteRepository.findById(siteId)
                .orElseThrow(() -> new ResourceNotFoundException("Site not found: " + siteId));
    }
}
