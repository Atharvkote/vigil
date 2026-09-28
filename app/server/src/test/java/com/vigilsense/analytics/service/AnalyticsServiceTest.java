package com.vigilsense.analytics.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vigilsense.analytics.dto.SiteAnalyticsResponse;
import com.vigilsense.analytics.dto.SiteReportResponse;
import com.vigilsense.calibration.entity.CalibrationRecommendation;
import com.vigilsense.calibration.repository.CalibrationRecommendationRepository;
import com.vigilsense.calibration.rule.CalibrationAction;
import com.vigilsense.calibration.rule.RiskLevel;
import com.vigilsense.sensor.entity.Sensor;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;
import com.vigilsense.weather.entity.WeatherRecord;
import com.vigilsense.weather.repository.WeatherRecordRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock SiteRepository siteRepository;
    @Mock WeatherRecordRepository weatherRecordRepository;
    @Mock CalibrationRecommendationRepository recommendationRepository;

    @InjectMocks AnalyticsService analyticsService;

    @Test
    void getSiteAnalytics_calculatesAveragesAndTotals() {
        Site site = stubSite();
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        
        WeatherRecord w1 = stubWeather(new BigDecimal("20"), new BigDecimal("50"), new BigDecimal("0"), new BigDecimal("5"), false);
        WeatherRecord w2 = stubWeather(new BigDecimal("30"), new BigDecimal("60"), new BigDecimal("10"), new BigDecimal("15"), true);
        
        when(weatherRecordRepository.findBySiteIdOrderByObservedAtDesc(1L)).thenReturn(List.of(w1, w2));
        
        CalibrationRecommendation r1 = stubRecommendation("HIGH", "DECREASE");
        when(recommendationRepository.findAll()).thenReturn(List.of(r1));

        SiteAnalyticsResponse response = analyticsService.getSiteAnalytics(1L, null, null);

        assertEquals(2, response.weather().totalObservations());
        assertEquals(new BigDecimal("25.00"), response.weather().avgTemperatureC()); // (20+30)/2
        assertEquals(new BigDecimal("55.00"), response.weather().avgHumidityPercent()); // (50+60)/2
        assertEquals(new BigDecimal("15"), response.weather().maxWindSpeedMs());
        assertEquals(new BigDecimal("10"), response.weather().totalRainfallMm());
        assertEquals(1, response.weather().stormCount());
        
        assertEquals(1, response.calibration().totalRecommendations());
        assertEquals(1, response.calibration().recommendationsByRiskLevel().get("HIGH"));
        assertEquals(1, response.calibration().actionsCount().get("DECREASE"));
    }

    @Test
    void getSiteReport_combinesAnalyticsAndRecentData() {
        Site site = stubSite();
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        
        when(weatherRecordRepository.findBySiteIdAndRetrievedAtBetweenOrderByObservedAtDesc(eq(1L), any(Instant.class), any(Instant.class)))
            .thenReturn(List.of());
            
        when(recommendationRepository.findAll()).thenReturn(List.of());

        SiteReportResponse response = analyticsService.getSiteReport(1L);
        
        assertEquals(1L, response.siteId());
        assertEquals("Test Site", response.siteName());
        assertEquals("Last 30 Days", response.timeRange());
        assertNotNull(response.analyticsSummary());
        assertTrue(response.recentWeather().isEmpty());
        assertTrue(response.recentRecommendations().isEmpty());
    }

    private Site stubSite() {
        Site site = new Site();
        site.setId(1L);
        site.setName("Test Site");
        return site;
    }
    
    private WeatherRecord stubWeather(BigDecimal temp, BigDecimal hum, BigDecimal rain, BigDecimal wind, boolean storm) {
        WeatherRecord w = new WeatherRecord();
        w.setTemperatureC(temp);
        w.setHumidityPercent(hum);
        w.setRainfallMm(rain);
        w.setWindSpeedMs(wind);
        w.setStormCondition(storm);
        return w;
    }
    
    private CalibrationRecommendation stubRecommendation(String risk, String action) {
        CalibrationRecommendation r = new CalibrationRecommendation();
        Site site = new Site();
        site.setId(1L);
        r.setSite(site);
        Sensor sensor = new Sensor();
        sensor.setName("Sensor 1");
        r.setSensor(sensor);
        r.setRiskLevel(RiskLevel.valueOf(risk));
        r.setAction(CalibrationAction.valueOf(action));
        r.setCreatedAt(Instant.now());
        return r;
    }
}
