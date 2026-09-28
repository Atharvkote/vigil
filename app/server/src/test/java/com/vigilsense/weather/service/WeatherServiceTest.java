package com.vigilsense.weather.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.common.exception.WeatherProviderException;
import com.vigilsense.config.WeatherProperties;
import com.vigilsense.site.entity.Site;
import com.vigilsense.site.repository.SiteRepository;
import com.vigilsense.weather.client.WeatherClient;
import com.vigilsense.weather.dto.FetchedObservation;
import com.vigilsense.weather.dto.WeatherResponse;
import com.vigilsense.weather.entity.WeatherRecord;
import com.vigilsense.weather.repository.WeatherRecordRepository;

@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    @Mock
    private SiteRepository siteRepository;

    @Mock
    private WeatherRecordRepository weatherRecordRepository;

    @Mock
    private WeatherClient weatherClient;

    private WeatherService weatherService;
    private Site site;
    private final Instant now = Instant.parse("2026-09-27T12:00:00Z");

    @BeforeEach
    void setUp() {
        WeatherProperties properties = new WeatherProperties();
        properties.setStaleAfter(Duration.ofMinutes(30));
        weatherService = new WeatherService(
                siteRepository,
                weatherRecordRepository,
                weatherClient,
                properties,
                Clock.fixed(now, ZoneOffset.UTC));
        site = new Site();
        site.setId(1L);
        site.setName("Industrial Site A");
        site.setLatitude(new BigDecimal("19.0760000"));
        site.setLongitude(new BigDecimal("72.8777000"));
    }

    @Test
    void currentMarksStaleWhenRetrievedPastThreshold() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        WeatherRecord record = storedRecord(now.minus(Duration.ofMinutes(31)));
        when(weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(1L)).thenReturn(Optional.of(record));

        WeatherResponse response = weatherService.current(1L);

        assertThat(response.stale()).isTrue();
        assertThat(response.temperatureC()).isEqualByComparingTo("31.4");
        verify(weatherClient, never()).fetch(any(), any());
    }

    @Test
    void currentThrowsWhenNoStoredWeather() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> weatherService.current(1L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("refresh");
    }

    @Test
    void refreshPersistsNormalizedObservationWithoutCalibration() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(weatherClient.fetch(site.getLatitude(), site.getLongitude())).thenReturn(observation(now));
        when(weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(1L)).thenReturn(Optional.empty());
        when(weatherRecordRepository.save(any(WeatherRecord.class))).thenAnswer(invocation -> {
            WeatherRecord record = invocation.getArgument(0);
            record.setId(42L);
            return record;
        });

        WeatherResponse response = weatherService.refresh(1L);

        assertThat(response.id()).isEqualTo(42L);
        assertThat(response.windSpeedMs()).isEqualByComparingTo("12.5");
        assertThat(response.units()).contains("m/s");
        assertThat(response.stale()).isFalse();
        verify(weatherRecordRepository).save(any(WeatherRecord.class));
    }

    @Test
    void refreshDoesNotInsertDuplicateObservationTime() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        WeatherRecord existing = storedRecord(now.minusSeconds(60));
        when(weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(1L)).thenReturn(Optional.of(existing));
        when(weatherClient.fetch(site.getLatitude(), site.getLongitude()))
                .thenReturn(observation(existing.getObservedAt()));

        WeatherResponse response = weatherService.refresh(1L);

        assertThat(response.id()).isEqualTo(7L);
        verify(weatherRecordRepository, never()).save(any(WeatherRecord.class));
    }

    @Test
    void refreshPropagatesProviderFailure() {
        when(siteRepository.findById(1L)).thenReturn(Optional.of(site));
        when(weatherClient.fetch(site.getLatitude(), site.getLongitude()))
                .thenThrow(new WeatherProviderException("Weather provider timeout or connection failure"));

        assertThatThrownBy(() -> weatherService.refresh(1L))
                .isInstanceOf(WeatherProviderException.class)
                .hasMessageContaining("timeout");
        verify(weatherRecordRepository, never()).save(any(WeatherRecord.class));
    }

    private WeatherRecord storedRecord(Instant retrievedAt) {
        WeatherRecord record = new WeatherRecord();
        record.setId(7L);
        record.setSite(site);
        record.setLatitude(site.getLatitude());
        record.setLongitude(site.getLongitude());
        record.setTemperatureC(new BigDecimal("31.4"));
        record.setHumidityPercent(new BigDecimal("80"));
        record.setRainfallMm(new BigDecimal("1.0"));
        record.setWindSpeedMs(new BigDecimal("5.0"));
        record.setWeatherCode(1);
        record.setStormCondition(false);
        record.setObservedAt(Instant.parse("2026-09-27T11:00:00Z"));
        record.setRetrievedAt(retrievedAt);
        record.setSource("open-meteo");
        record.setPartial(false);
        return record;
    }

    private static FetchedObservation observation(Instant observedAt) {
        return new FetchedObservation(
                new BigDecimal("19.076"),
                new BigDecimal("72.8777"),
                new BigDecimal("31.4"),
                new BigDecimal("86"),
                new BigDecimal("8.2"),
                new BigDecimal("12.5"),
                new BigDecimal("18.0"),
                1,
                false,
                observedAt,
                Instant.parse("2026-09-27T12:00:00Z"),
                "open-meteo",
                false,
                List.of());
    }
}
