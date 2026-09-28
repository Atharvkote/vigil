package com.vigilsense.calibration.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.vigilsense.calibration.dto.CalibrationResponse;
import com.vigilsense.calibration.engine.CalibrationEngine;
import com.vigilsense.calibration.engine.EngineRecommendation;
import com.vigilsense.calibration.engine.EvaluationInput;
import com.vigilsense.calibration.entity.CalibrationRecommendation;
import com.vigilsense.calibration.entity.CalibrationRuleEntity;
import com.vigilsense.calibration.entity.RecommendationStatus;
import com.vigilsense.calibration.repository.CalibrationRecommendationRepository;
import com.vigilsense.calibration.repository.CalibrationRuleRepository;
import com.vigilsense.calibration.rule.CalibrationAction;
import com.vigilsense.calibration.rule.RiskLevel;
import com.vigilsense.calibration.rule.RuleOperator;
import com.vigilsense.calibration.rule.WeatherFactor;
import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor.entity.Sensor;
import com.vigilsense.sensor.entity.SensorConfiguration;
import com.vigilsense.sensor.repository.SensorRepository;
import com.vigilsense.sensor_profile.entity.SensorParameter;
import com.vigilsense.sensor_profile.entity.SensorProfile;
import com.vigilsense.sensor_profile.repository.SensorProfileRepository;
import com.vigilsense.site.entity.Site;
import com.vigilsense.weather.entity.WeatherRecord;
import com.vigilsense.weather.repository.WeatherRecordRepository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CalibrationServiceTest {

    @Mock SensorRepository sensorRepository;
    @Mock SensorProfileRepository sensorProfileRepository;
    @Mock WeatherRecordRepository weatherRecordRepository;
    @Mock CalibrationRuleRepository calibrationRuleRepository;
    @Mock CalibrationRecommendationRepository recommendationRepository;
    @Mock CalibrationEngine calibrationEngine;
    @Mock com.vigilsense.ai.service.AiRecommendationService aiRecommendationService;
    @Mock com.vigilsense.ai.repository.AiAnalysisRepository aiAnalysisRepository;

    @InjectMocks CalibrationService calibrationService;

    @Test
    void current_returnsMostRecentRecommendation() {
        CalibrationRecommendation rec = stubRecommendation();
        when(sensorRepository.findById(1L)).thenReturn(Optional.of(rec.getSensor()));
        when(recommendationRepository.findLatestBySensorId(1L)).thenReturn(Optional.of(rec));

        CalibrationResponse response = calibrationService.current(1L);

        assertEquals(1L, response.sensorId());
        assertEquals("HIGH", response.riskLevel());
        assertEquals("sensitivity", response.affectedParameter());
    }

    @Test
    void current_sensorNotFound_throws404() {
        when(sensorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> calibrationService.current(99L));
    }

    @Test
    void current_noRecommendation_throws404() {
        when(sensorRepository.findById(1L)).thenReturn(Optional.of(stubSensor()));
        when(recommendationRepository.findLatestBySensorId(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> calibrationService.current(1L));
    }

    @Test
    void history_returnsAllRecommendations() {
        CalibrationRecommendation rec = stubRecommendation();
        when(sensorRepository.findById(1L)).thenReturn(Optional.of(rec.getSensor()));
        when(recommendationRepository.findAllBySensorIdOrderByCreatedAtDesc(1L))
                .thenReturn(List.of(rec));

        List<CalibrationResponse> responses = calibrationService.history(1L);

        assertEquals(1, responses.size());
    }

    @Test
    void evaluate_runsEngineAndPersists() {
        Sensor sensor = stubSensorWithDetails();
        SensorProfile profile = stubProfile();
        WeatherRecord weather = stubWeatherRecord(sensor.getSite());

        when(sensorRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(sensor));
        when(sensorProfileRepository.findByIdWithParameters(1L)).thenReturn(Optional.of(profile));
        when(weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(1L))
                .thenReturn(Optional.of(weather));
        when(calibrationRuleRepository.findByProfileIdAndActiveTrue(1L)).thenReturn(List.of());

        EngineRecommendation engineResult = new EngineRecommendation(
                RiskLevel.LOW, "sensitivity", new BigDecimal("70"), new BigDecimal("80"),
                new BigDecimal("10"), new BigDecimal("100"),
                CalibrationAction.INCREASE, List.of("Normal weather; higher sensitivity"),
                "1.0", "1.0");
        when(calibrationEngine.evaluate(any(EvaluationInput.class))).thenReturn(engineResult);
        when(recommendationRepository.save(any())).thenAnswer(inv -> {
            CalibrationRecommendation entity = inv.getArgument(0);
            entity.setId(100L);
            return entity;
        });
        when(aiRecommendationService.generateExplanation(any()))
            .thenReturn(new com.vigilsense.ai.dto.AiCalibrationResponse("Summary", "Reason"));
        when(aiAnalysisRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        CalibrationResponse response = calibrationService.evaluate(1L);

        assertEquals("sensitivity", response.affectedParameter());
        assertEquals("INCREASE", response.action());
        verify(recommendationRepository).save(any(CalibrationRecommendation.class));
    }

    @Test
    void evaluate_noWeather_throws404() {
        Sensor sensor = stubSensorWithDetails();
        SensorProfile profile = stubProfile();

        when(sensorRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(sensor));
        when(sensorProfileRepository.findByIdWithParameters(1L)).thenReturn(Optional.of(profile));
        when(weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(1L))
                .thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class,
                () -> calibrationService.evaluate(1L));
        assertTrue(ex.getMessage().contains("weather"));
    }

    // --- Stub builders ---

    private Sensor stubSensor() {
        Sensor sensor = new Sensor();
        sensor.setId(1L);
        return sensor;
    }

    private Sensor stubSensorWithDetails() {
        Site site = new Site();
        site.setId(1L);
        site.setLatitude(new BigDecimal("28.6139"));
        site.setLongitude(new BigDecimal("77.2090"));

        SensorProfile profile = new SensorProfile();
        profile.setId(1L);
        profile.setCode("FIBER_OPTIC_FENCE");
        profile.setProfileVersion("1.0");
        profile.setRelevantWeatherFactors("WIND_SPEED,RAINFALL,STORM");

        SensorParameter param = new SensorParameter();
        param.setId(1L);
        param.setParameterKey("sensitivity");
        param.setMinValue(new BigDecimal("10"));
        param.setMaxValue(new BigDecimal("100"));
        param.setDefaultValue(new BigDecimal("70"));
        param.setProfile(profile);

        Sensor sensor = new Sensor();
        sensor.setId(1L);
        sensor.setSite(site);
        sensor.setProfile(profile);

        SensorConfiguration config = new SensorConfiguration();
        config.setSensor(sensor);
        config.setParameter(param);
        config.setCurrentValue(new BigDecimal("70"));
        config.setCapturedAt(Instant.now());
        sensor.getConfigurations().add(config);

        return sensor;
    }

    private SensorProfile stubProfile() {
        SensorProfile profile = new SensorProfile();
        profile.setId(1L);
        profile.setCode("FIBER_OPTIC_FENCE");
        profile.setProfileVersion("1.0");
        profile.setRelevantWeatherFactors("WIND_SPEED,RAINFALL,STORM");

        SensorParameter param = new SensorParameter();
        param.setId(1L);
        param.setParameterKey("sensitivity");
        param.setDisplayName("Sensitivity");
        param.setUnit("%");
        param.setDataType("DECIMAL");
        param.setMinValue(new BigDecimal("10"));
        param.setMaxValue(new BigDecimal("100"));
        param.setDefaultValue(new BigDecimal("70"));
        param.setSortOrder(1);
        param.setProfile(profile);
        profile.setParameters(List.of(param));

        return profile;
    }

    private WeatherRecord stubWeatherRecord(Site site) {
        WeatherRecord record = new WeatherRecord();
        record.setId(1L);
        record.setSite(site);
        record.setLatitude(site.getLatitude());
        record.setLongitude(site.getLongitude());
        record.setTemperatureC(new BigDecimal("22"));
        record.setHumidityPercent(new BigDecimal("45"));
        record.setRainfallMm(new BigDecimal("0"));
        record.setWindSpeedMs(new BigDecimal("3.0"));
        record.setWeatherCode(0);
        record.setStormCondition(false);
        record.setObservedAt(Instant.now());
        record.setRetrievedAt(Instant.now());
        record.setSource("open-meteo");
        record.setPartial(false);
        return record;
    }

    private CalibrationRecommendation stubRecommendation() {
        Site site = new Site();
        site.setId(1L);

        Sensor sensor = new Sensor();
        sensor.setId(1L);
        sensor.setSite(site);

        SensorProfile profile = new SensorProfile();
        profile.setId(1L);
        profile.setCode("FIBER_OPTIC_FENCE");
        profile.setProfileVersion("1.0");

        WeatherRecord weather = new WeatherRecord();
        weather.setId(1L);
        weather.setSite(site);
        weather.setTemperatureC(new BigDecimal("15"));
        weather.setHumidityPercent(new BigDecimal("90"));
        weather.setRainfallMm(new BigDecimal("12"));
        weather.setWindSpeedMs(new BigDecimal("18"));
        weather.setStormCondition(true);
        weather.setObservedAt(Instant.now());
        weather.setRetrievedAt(Instant.now());

        CalibrationRecommendation rec = new CalibrationRecommendation();
        rec.setId(1L);
        rec.setSensor(sensor);
        rec.setSite(site);
        rec.setWeatherRecord(weather);
        rec.setSensorProfile(profile);
        rec.setRiskLevel(RiskLevel.HIGH);
        rec.setAffectedParameter("sensitivity");
        rec.setCurrentValue(new BigDecimal("70"));
        rec.setRecommendedValue(new BigDecimal("40"));
        rec.setRecommendedMin(new BigDecimal("10"));
        rec.setRecommendedMax(new BigDecimal("100"));
        rec.setAction(CalibrationAction.DECREASE);
        rec.setReasons("Storm condition detected; lower sensitivity to reduce false alarms");
        rec.setProfileVersion("1.0");
        rec.setRuleVersion("1.0");
        rec.setStatus(RecommendationStatus.GENERATED);
        return rec;
    }
}
