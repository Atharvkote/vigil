package com.vigilsense.calibration.service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.vigilsense.ai.service.AiRecommendationService;
import com.vigilsense.calibration.rule.CalibrationAction;

import com.vigilsense.calibration.dto.CalibrationResponse;
import com.vigilsense.calibration.engine.CalibrationEngine;
import com.vigilsense.calibration.engine.EngineRecommendation;
import com.vigilsense.calibration.engine.EvaluationInput;
import com.vigilsense.calibration.engine.ParameterSpec;
import com.vigilsense.calibration.engine.ProfileSnapshot;
import com.vigilsense.calibration.engine.WeatherSnapshot;
import com.vigilsense.calibration.entity.CalibrationRecommendation;
import com.vigilsense.calibration.entity.CalibrationRuleEntity;
import com.vigilsense.calibration.repository.CalibrationRecommendationRepository;
import com.vigilsense.calibration.repository.CalibrationRuleRepository;
import com.vigilsense.calibration.rule.CalibrationRule;
import com.vigilsense.calibration.rule.RuleAction;
import com.vigilsense.calibration.rule.RuleCondition;
import com.vigilsense.calibration.rule.RuleOperator;
import com.vigilsense.calibration.rule.WeatherFactor;
import com.vigilsense.common.exception.ResourceNotFoundException;
import com.vigilsense.sensor.entity.Sensor;
import com.vigilsense.sensor.entity.SensorConfiguration;
import com.vigilsense.sensor.repository.SensorRepository;
import com.vigilsense.sensor_profile.entity.SensorParameter;
import com.vigilsense.sensor_profile.entity.SensorProfile;
import com.vigilsense.sensor_profile.repository.SensorProfileRepository;
import com.vigilsense.weather.entity.WeatherRecord;
import com.vigilsense.weather.repository.WeatherRecordRepository;

@Service
@Transactional(readOnly = true)
public class CalibrationService {

    private final SensorRepository sensorRepository;
    private final SensorProfileRepository sensorProfileRepository;
    private final WeatherRecordRepository weatherRecordRepository;
    private final CalibrationRuleRepository calibrationRuleRepository;
    private final CalibrationRecommendationRepository recommendationRepository;
    private final CalibrationEngine calibrationEngine;

    private final AiRecommendationService aiRecommendationService;
    private final com.vigilsense.ai.repository.AiAnalysisRepository aiAnalysisRepository;

    public CalibrationService(
            SensorRepository sensorRepository,
            SensorProfileRepository sensorProfileRepository,
            WeatherRecordRepository weatherRecordRepository,
            CalibrationRuleRepository calibrationRuleRepository,
            CalibrationRecommendationRepository recommendationRepository,
            CalibrationEngine calibrationEngine,
            AiRecommendationService aiRecommendationService,
            com.vigilsense.ai.repository.AiAnalysisRepository aiAnalysisRepository) {
        this.sensorRepository = sensorRepository;
        this.sensorProfileRepository = sensorProfileRepository;
        this.weatherRecordRepository = weatherRecordRepository;
        this.calibrationRuleRepository = calibrationRuleRepository;
        this.recommendationRepository = recommendationRepository;
        this.calibrationEngine = calibrationEngine;
        this.aiRecommendationService = aiRecommendationService;
        this.aiAnalysisRepository = aiAnalysisRepository;
    }

    public CalibrationResponse current(Long sensorId) {
        requireSensor(sensorId);
        CalibrationRecommendation rec = recommendationRepository.findLatestBySensorId(sensorId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No calibration recommendation for sensor " + sensorId
                                + ". POST /api/v1/sensors/" + sensorId
                                + "/calibration/evaluate to generate one."));
        return buildResponse(rec);
    }

    public List<CalibrationResponse> history(Long sensorId) {
        requireSensor(sensorId);
        return recommendationRepository.findAllBySensorIdOrderByCreatedAtDesc(sensorId)
                .stream()
                .map(this::buildResponse)
                .toList();
    }

    private CalibrationResponse buildResponse(CalibrationRecommendation rec) {
        var aiAnalysisOpt = aiAnalysisRepository.findByRecommendationId(rec.getId());
        if (aiAnalysisOpt.isPresent()) {
            return CalibrationResponse.from(rec, aiAnalysisOpt.get().getResponseSummary(), aiAnalysisOpt.get().getReasoningSummary());
        }
        return CalibrationResponse.from(rec, null, null);
    }

    @Transactional
    public CalibrationResponse evaluate(Long sensorId) {
        Sensor sensor = requireSensorWithDetails(sensorId);
        Long siteId = sensor.getSite().getId();

        // Load the full sensor profile with parameters
        SensorProfile profile = sensorProfileRepository.findByIdWithParameters(sensor.getProfile().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sensor profile not found: " + sensor.getProfile().getId()));

        // Get the latest weather record for the site
        WeatherRecord weather = weatherRecordRepository.findFirstBySiteIdOrderByRetrievedAtDesc(siteId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No weather recorded for site " + siteId
                                + ". POST /api/v1/sites/" + siteId
                                + "/weather/refresh to fetch live data first."));

        // Load active rules for this profile
        List<CalibrationRuleEntity> ruleEntities = calibrationRuleRepository
                .findByProfileIdAndActiveTrue(profile.getId());
        List<CalibrationRule> rules = ruleEntities.stream()
                .map(CalibrationService::toDomainRule)
                .toList();

        // Build engine input
        ProfileSnapshot profileSnapshot = toProfileSnapshot(profile);
        WeatherSnapshot weatherSnapshot = toWeatherSnapshot(weather);
        Map<String, BigDecimal> currentConfig = buildCurrentConfig(sensor);

        EvaluationInput input = new EvaluationInput(
                sensorId, siteId, profileSnapshot, weatherSnapshot, currentConfig, rules);

        // Run engine
        EngineRecommendation engineResult = calibrationEngine.evaluate(input);

        // Persist
        CalibrationRecommendation entity = toEntity(sensor, weather, profile, engineResult);
        CalibrationRecommendation saved = recommendationRepository.save(entity);

        com.vigilsense.ai.entity.AiAnalysis savedAiAnalysis = null;
        // Request AI Context
        if (engineResult.action() != CalibrationAction.MAINTAIN && engineResult.affectedParameter() != null) {
            String recommendedRange = engineResult.recommendedMin() + "-" + engineResult.recommendedMax();
            com.vigilsense.ai.dto.AiCalibrationRequest aiReq = new com.vigilsense.ai.dto.AiCalibrationRequest(
                profile.getName(), // sensorType
                "Unknown", // manufacturer
                profile.getCode(), // model
                weather.getWindSpeedMs(),
                weather.getRainfallMm(),
                weather.getTemperatureC(),
                weather.getHumidityPercent(),
                weather.isStormCondition() ? "STORM" : "NORMAL",
                engineResult.affectedParameter(),
                engineResult.currentValue(),
                engineResult.action().name(),
                engineResult.riskLevel().name(),
                recommendedRange
            );
            com.vigilsense.ai.dto.AiCalibrationResponse aiResp = aiRecommendationService.generateExplanation(aiReq);
            
            com.vigilsense.ai.entity.AiAnalysis aiAnalysis = new com.vigilsense.ai.entity.AiAnalysis(
                saved, "MockProvider", "MockModel", "v1", aiResp.summary(), aiResp.reason()
            );
            savedAiAnalysis = aiAnalysisRepository.save(aiAnalysis);
        }

        if (savedAiAnalysis != null) {
            return CalibrationResponse.from(saved, savedAiAnalysis.getResponseSummary(), savedAiAnalysis.getReasoningSummary());
        }
        return CalibrationResponse.from(saved, null, null);
    }

    // --- Mapping helpers ---

    private static CalibrationRule toDomainRule(CalibrationRuleEntity entity) {
        RuleCondition condition = new RuleCondition(
                entity.getWeatherFactor(),
                entity.getOperator(),
                entity.getThreshold());
        RuleAction action = new RuleAction(
                entity.getParameterKey(),
                entity.getAction(),
                entity.getTargetValue(),
                entity.getAdjustmentValue());
        return new CalibrationRule(
                entity.getId(),
                entity.getProfile().getId(),
                condition,
                action,
                entity.getPriority(),
                entity.getExplanation(),
                entity.getRuleVersion(),
                entity.isActive());
    }

    private static ProfileSnapshot toProfileSnapshot(SensorProfile profile) {
        List<String> weatherFactors = profile.getRelevantWeatherFactors() == null
                ? List.of()
                : Arrays.stream(profile.getRelevantWeatherFactors().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList();

        Map<String, ParameterSpec> params = new LinkedHashMap<>();
        for (SensorParameter param : profile.getParameters()) {
            params.put(param.getParameterKey(), new ParameterSpec(
                    param.getParameterKey(),
                    param.getMinValue(),
                    param.getMaxValue(),
                    param.getDefaultValue()));
        }

        return new ProfileSnapshot(
                profile.getId(),
                profile.getCode(),
                profile.getProfileVersion(),
                weatherFactors,
                params);
    }

    private static WeatherSnapshot toWeatherSnapshot(WeatherRecord record) {
        return new WeatherSnapshot(
                record.getId(),
                record.getTemperatureC(),
                record.getHumidityPercent(),
                record.getRainfallMm(),
                record.getWindSpeedMs(),
                record.getWindGustMs(),
                record.getWeatherCode(),
                record.isStormCondition(),
                record.getObservedAt(),
                record.getRetrievedAt(),
                record.isPartial());
    }

    private static Map<String, BigDecimal> buildCurrentConfig(Sensor sensor) {
        Map<String, BigDecimal> config = new LinkedHashMap<>();
        for (SensorConfiguration sc : sensor.getConfigurations()) {
            config.put(sc.getParameter().getParameterKey(), sc.getCurrentValue());
        }
        return config;
    }

    private static CalibrationRecommendation toEntity(
            Sensor sensor,
            WeatherRecord weather,
            SensorProfile profile,
            EngineRecommendation result) {
        CalibrationRecommendation entity = new CalibrationRecommendation();
        entity.setSensor(sensor);
        entity.setSite(sensor.getSite());
        entity.setWeatherRecord(weather);
        entity.setSensorProfile(profile);
        entity.setRiskLevel(result.riskLevel());
        entity.setAffectedParameter(result.affectedParameter());
        entity.setCurrentValue(result.currentValue());
        entity.setRecommendedValue(result.recommendedValue());
        entity.setRecommendedMin(result.recommendedMin());
        entity.setRecommendedMax(result.recommendedMax());
        entity.setAction(result.action());
        entity.setReasons(String.join("|", result.reasons()));
        entity.setProfileVersion(result.profileVersion());
        entity.setRuleVersion(result.ruleVersion());
        return entity;
    }

    private Sensor requireSensor(Long sensorId) {
        return sensorRepository.findById(sensorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sensor not found: " + sensorId));
    }

    private Sensor requireSensorWithDetails(Long sensorId) {
        return sensorRepository.findByIdWithDetails(sensorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sensor not found: " + sensorId));
    }
}
