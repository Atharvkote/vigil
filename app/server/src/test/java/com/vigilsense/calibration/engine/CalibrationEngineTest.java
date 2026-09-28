package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.vigilsense.calibration.rule.CalibrationAction;
import com.vigilsense.calibration.rule.CalibrationRule;
import com.vigilsense.calibration.rule.RiskLevel;
import com.vigilsense.calibration.rule.RuleAction;
import com.vigilsense.calibration.rule.RuleCondition;
import com.vigilsense.calibration.rule.RuleOperator;
import com.vigilsense.calibration.rule.WeatherFactor;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Pure-Java unit tests for the CalibrationEngine pipeline.
 * No Spring context — validates the engine, weather impact analyzer,
 * rule evaluator, and recommendation builder directly.
 */
class CalibrationEngineTest {

    private final CalibrationEngine engine = new CalibrationEngine(
            new WeatherImpactAnalyzer(),
            new RuleEvaluator(),
            new RecommendationBuilder());

    // --- Profile definitions ---

    private static final ProfileSnapshot FIBER_OPTIC = new ProfileSnapshot(
            1L, "FIBER_OPTIC_FENCE", "1.0",
            List.of("WIND_SPEED", "WIND_GUST", "RAINFALL", "STORM"),
            Map.of("sensitivity", new ParameterSpec("sensitivity", new BigDecimal("10"), new BigDecimal("100"), new BigDecimal("70")),
                    "alarm_threshold", new ParameterSpec("alarm_threshold", new BigDecimal("10"), new BigDecimal("90"), new BigDecimal("45"))));

    private static final ProfileSnapshot MICROWAVE = new ProfileSnapshot(
            2L, "MICROWAVE", "1.0",
            List.of("WIND_SPEED", "RAINFALL", "STORM"),
            Map.of("detection_range", new ParameterSpec("detection_range", new BigDecimal("50"), new BigDecimal("200"), new BigDecimal("140")),
                    "alarm_delay", new ParameterSpec("alarm_delay", new BigDecimal("1"), new BigDecimal("15"), new BigDecimal("3"))));

    private static final ProfileSnapshot INFRARED = new ProfileSnapshot(
            3L, "INFRARED_BEAM", "1.0",
            List.of("RAINFALL", "STORM"),
            Map.of("beam_threshold", new ParameterSpec("beam_threshold", new BigDecimal("10"), new BigDecimal("90"), new BigDecimal("65"))));

    // --- Rules matching seed data ---

    private static final List<CalibrationRule> FIBER_RULES = List.of(
            rule(1L, 1L, WeatherFactor.STORM, RuleOperator.IS_TRUE, null, "sensitivity", CalibrationAction.SET, bd("40"), null, 100, "Storm condition detected; lower sensitivity to reduce false alarms"),
            rule(2L, 1L, WeatherFactor.WIND_SPEED, RuleOperator.GTE, bd("11.1"), "sensitivity", CalibrationAction.SET, bd("50"), null, 80, "High wind speed detected; lower sensitivity"),
            rule(3L, 1L, WeatherFactor.RAINFALL, RuleOperator.GTE, bd("4.0"), "sensitivity", CalibrationAction.SET, bd("60"), null, 60, "Heavy rain detected; medium sensitivity"),
            rule(4L, 1L, WeatherFactor.NORMAL, RuleOperator.IS_TRUE, null, "sensitivity", CalibrationAction.SET, bd("80"), null, 10, "Normal weather; higher sensitivity"));

    private static final List<CalibrationRule> MICROWAVE_RULES = List.of(
            rule(5L, 2L, WeatherFactor.STORM, RuleOperator.IS_TRUE, null, "detection_range", CalibrationAction.SET, bd("80"), null, 100, "Storm condition detected; shorten detection range"),
            rule(6L, 2L, WeatherFactor.WIND_SPEED, RuleOperator.GTE, bd("11.1"), "detection_range", CalibrationAction.SET, bd("90"), null, 80, "High wind speed detected; shorten detection range"),
            rule(7L, 2L, WeatherFactor.RAINFALL, RuleOperator.GTE, bd("4.0"), "alarm_delay", CalibrationAction.SET, bd("8"), null, 60, "Heavy rain detected; increase alarm delay"),
            rule(8L, 2L, WeatherFactor.NORMAL, RuleOperator.IS_TRUE, null, "detection_range", CalibrationAction.SET, bd("140"), null, 10, "Normal weather; longer detection range"));

    private static final List<CalibrationRule> INFRARED_RULES = List.of(
            rule(9L, 3L, WeatherFactor.STORM, RuleOperator.IS_TRUE, null, "beam_threshold", CalibrationAction.SET, bd("35"), null, 100, "Storm condition detected; lower beam interruption threshold"),
            rule(10L, 3L, WeatherFactor.RAINFALL, RuleOperator.GTE, bd("4.0"), "beam_threshold", CalibrationAction.SET, bd("45"), null, 60, "Heavy rain detected; medium beam interruption threshold"),
            rule(11L, 3L, WeatherFactor.NORMAL, RuleOperator.IS_TRUE, null, "beam_threshold", CalibrationAction.SET, bd("65"), null, 10, "Normal weather; higher beam interruption threshold"));

    // ============================================================
    // Case-study scenario tests (AC-07, AC-08, AC-09)
    // ============================================================

    @Test
    void normalWeather_fiberOptic_higherSensitivity() {
        WeatherSnapshot weather = normalWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("50"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(RiskLevel.LOW, result.riskLevel());
        assertEquals("sensitivity", result.affectedParameter());
        assertEquals(bd("80"), result.recommendedValue());
        assertEquals(CalibrationAction.INCREASE, result.action());
        assertTrue(result.reasons().stream().anyMatch(r -> r.contains("Normal weather")));
    }

    @Test
    void highWind_fiberOptic_lowerSensitivity() {
        WeatherSnapshot weather = highWindWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("70"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(RiskLevel.MEDIUM, result.riskLevel());
        assertEquals("sensitivity", result.affectedParameter());
        assertEquals(bd("50"), result.recommendedValue());
        assertEquals(CalibrationAction.DECREASE, result.action());
        assertTrue(result.reasons().stream().anyMatch(r -> r.contains("wind")));
    }

    @Test
    void heavyRain_fiberOptic_mediumSensitivity() {
        WeatherSnapshot weather = heavyRainWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("70"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(RiskLevel.MEDIUM, result.riskLevel());
        assertEquals("sensitivity", result.affectedParameter());
        assertEquals(bd("60"), result.recommendedValue());
        assertEquals(CalibrationAction.DECREASE, result.action());
        assertTrue(result.reasons().stream().anyMatch(r -> r.contains("rain")));
    }

    @Test
    void storm_fiberOptic_lowestSensitivity() {
        WeatherSnapshot weather = stormWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("70"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(RiskLevel.HIGH, result.riskLevel());
        assertEquals("sensitivity", result.affectedParameter());
        assertEquals(bd("40"), result.recommendedValue());
        assertEquals(CalibrationAction.DECREASE, result.action());
        assertTrue(result.reasons().stream().anyMatch(r -> r.contains("Storm")));
    }

    // ============================================================
    // Microwave sensor — different parameter set
    // ============================================================

    @Test
    void highWind_microwave_shorterRange() {
        WeatherSnapshot weather = highWindWeather();
        Map<String, BigDecimal> config = Map.of("detection_range", bd("140"), "alarm_delay", bd("3"));
        EvaluationInput input = input(MICROWAVE, weather, config, MICROWAVE_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals("detection_range", result.affectedParameter());
        assertEquals(bd("90"), result.recommendedValue());
        assertEquals(CalibrationAction.DECREASE, result.action());
    }

    @Test
    void heavyRain_microwave_longerAlarmDelay() {
        WeatherSnapshot weather = heavyRainWeather();
        Map<String, BigDecimal> config = Map.of("detection_range", bd("140"), "alarm_delay", bd("3"));
        EvaluationInput input = input(MICROWAVE, weather, config, MICROWAVE_RULES);

        EngineRecommendation result = engine.evaluate(input);

        // Rainfall rule targets alarm_delay but detection_range rule for RAINFALL doesn't exist;
        // the winning rule should be the rainfall → alarm_delay (priority 60)
        assertEquals("alarm_delay", result.affectedParameter());
        assertEquals(bd("8"), result.recommendedValue());
        assertEquals(CalibrationAction.INCREASE, result.action());
    }

    @Test
    void normalWeather_microwave_longerRange() {
        WeatherSnapshot weather = normalWeather();
        Map<String, BigDecimal> config = Map.of("detection_range", bd("90"), "alarm_delay", bd("3"));
        EvaluationInput input = input(MICROWAVE, weather, config, MICROWAVE_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals("detection_range", result.affectedParameter());
        assertEquals(bd("140"), result.recommendedValue());
        assertEquals(CalibrationAction.INCREASE, result.action());
    }

    // ============================================================
    // Infrared — wind factor is NOT relevant for this profile
    // ============================================================

    @Test
    void highWind_infrared_noWindRuleApplies() {
        // Infrared profile only considers RAINFALL and STORM; wind rules should be skipped
        WeatherSnapshot weather = highWindWeather();
        Map<String, BigDecimal> config = Map.of("beam_threshold", bd("65"));
        EvaluationInput input = input(INFRARED, weather, config, INFRARED_RULES);

        EngineRecommendation result = engine.evaluate(input);

        // Since wind is not a factor for infrared, no wind rule fires.
        // Weather is not normal either (highWind is true in impact analyzer).
        // So no rule fires → MAINTAIN
        assertEquals(CalibrationAction.MAINTAIN, result.action());
    }

    @Test
    void heavyRain_infrared_lowerBeamThreshold() {
        WeatherSnapshot weather = heavyRainWeather();
        Map<String, BigDecimal> config = Map.of("beam_threshold", bd("65"));
        EvaluationInput input = input(INFRARED, weather, config, INFRARED_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals("beam_threshold", result.affectedParameter());
        assertEquals(bd("45"), result.recommendedValue());
        assertEquals(CalibrationAction.DECREASE, result.action());
    }

    @Test
    void storm_infrared_lowestBeamThreshold() {
        WeatherSnapshot weather = stormWeather();
        Map<String, BigDecimal> config = Map.of("beam_threshold", bd("65"));
        EvaluationInput input = input(INFRARED, weather, config, INFRARED_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals("beam_threshold", result.affectedParameter());
        assertEquals(bd("35"), result.recommendedValue());
        assertEquals(CalibrationAction.DECREASE, result.action());
    }

    // ============================================================
    // Combined factors
    // ============================================================

    @Test
    void highWindAndHeavyRain_fiberOptic_highRisk() {
        WeatherSnapshot weather = weather(bd("20"), bd("60"), bd("8.0"), bd("15.0"), null, false);
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("70"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(RiskLevel.HIGH, result.riskLevel());
        assertEquals("sensitivity", result.affectedParameter());
        // Wind rule (priority 80) wins over rainfall rule (priority 60)
        assertEquals(bd("50"), result.recommendedValue());
        // reasons should mention combined factors
        assertTrue(result.reasons().size() >= 2);
    }

    // ============================================================
    // Unsupported parameter — profile doesn't support sensitivity
    // ============================================================

    @Test
    void ruleTargetingUnsupportedParameter_isSkipped() {
        // Feed fiber-optic rules to microwave profile; sensitivity rules should be filtered out
        WeatherSnapshot weather = highWindWeather();
        Map<String, BigDecimal> config = Map.of("detection_range", bd("140"));
        EvaluationInput input = input(MICROWAVE, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        // Fiber rules target "sensitivity" which microwave doesn't support → no rule matches → MAINTAIN
        assertEquals(CalibrationAction.MAINTAIN, result.action());
    }

    // ============================================================
    // Edge: no rules at all
    // ============================================================

    @Test
    void noRules_returnsMaintain() {
        WeatherSnapshot weather = normalWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("70"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, List.of());

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(CalibrationAction.MAINTAIN, result.action());
        assertFalse(result.reasons().isEmpty());
    }

    // ============================================================
    // Edge: current value already matches recommendation → MAINTAIN
    // ============================================================

    @Test
    void currentAlreadyAtTarget_returnsMaintain() {
        WeatherSnapshot weather = normalWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("80")); // 80 is the NORMAL target
        EvaluationInput input = input(FIBER_OPTIC, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(CalibrationAction.MAINTAIN, result.action());
        assertEquals(bd("80"), result.recommendedValue());
    }

    // ============================================================
    // Clamping: target clamped to parameter min/max
    // ============================================================

    @Test
    void recommendedValue_isClamped() {
        // Create a rule that would SET sensitivity to 5 (below min 10)
        CalibrationRule rule = rule(99L, 1L, WeatherFactor.STORM, RuleOperator.IS_TRUE, null,
                "sensitivity", CalibrationAction.SET, bd("5"), null, 100, "Test clamp");
        WeatherSnapshot weather = stormWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("70"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, List.of(rule));

        EngineRecommendation result = engine.evaluate(input);

        assertEquals(bd("10"), result.recommendedValue()); // clamped to min
    }

    // ============================================================
    // Versions are propagated
    // ============================================================

    @Test
    void profileAndRuleVersions_arePropagated() {
        WeatherSnapshot weather = normalWeather();
        Map<String, BigDecimal> config = Map.of("sensitivity", bd("50"));
        EvaluationInput input = input(FIBER_OPTIC, weather, config, FIBER_RULES);

        EngineRecommendation result = engine.evaluate(input);

        assertEquals("1.0", result.profileVersion());
        assertEquals("1.0", result.ruleVersion());
    }

    // ============================================================
    // WeatherImpactAnalyzer unit tests
    // ============================================================

    @Test
    void weatherImpact_normalWeather() {
        WeatherImpactAnalyzer analyzer = new WeatherImpactAnalyzer();
        WeatherImpact impact = analyzer.analyze(normalWeather());

        assertEquals(RiskLevel.LOW, impact.riskLevel());
        assertTrue(impact.normal());
        assertFalse(impact.highWind());
        assertFalse(impact.heavyRain());
        assertFalse(impact.storm());
    }

    @Test
    void weatherImpact_highWind() {
        WeatherImpactAnalyzer analyzer = new WeatherImpactAnalyzer();
        WeatherImpact impact = analyzer.analyze(highWindWeather());

        assertEquals(RiskLevel.MEDIUM, impact.riskLevel());
        assertTrue(impact.highWind());
        assertFalse(impact.normal());
    }

    @Test
    void weatherImpact_storm() {
        WeatherImpactAnalyzer analyzer = new WeatherImpactAnalyzer();
        WeatherImpact impact = analyzer.analyze(stormWeather());

        assertEquals(RiskLevel.HIGH, impact.riskLevel());
        assertTrue(impact.storm());
        assertFalse(impact.normal());
    }

    @Test
    void weatherImpact_combinedHighWindAndHeavyRain() {
        WeatherSnapshot weather = weather(bd("20"), bd("60"), bd("8.0"), bd("15.0"), null, false);
        WeatherImpactAnalyzer analyzer = new WeatherImpactAnalyzer();
        WeatherImpact impact = analyzer.analyze(weather);

        assertEquals(RiskLevel.HIGH, impact.riskLevel());
        assertTrue(impact.highWind());
        assertTrue(impact.heavyRain());
        assertFalse(impact.normal());
    }

    // ============================================================
    // Helpers
    // ============================================================

    private static WeatherSnapshot normalWeather() {
        return weather(bd("22"), bd("45"), bd("0"), bd("3.0"), null, false);
    }

    private static WeatherSnapshot highWindWeather() {
        return weather(bd("20"), bd("50"), bd("0"), bd("15.0"), bd("20.0"), false);
    }

    private static WeatherSnapshot heavyRainWeather() {
        return weather(bd("18"), bd("85"), bd("8.5"), bd("5.0"), null, false);
    }

    private static WeatherSnapshot stormWeather() {
        return weather(bd("15"), bd("90"), bd("12.0"), bd("18.0"), bd("25.0"), true);
    }

    private static WeatherSnapshot weather(BigDecimal temp, BigDecimal humidity,
            BigDecimal rain, BigDecimal wind, BigDecimal gust, boolean storm) {
        return new WeatherSnapshot(
                1L, temp, humidity, rain, wind, gust, storm ? 95 : 0,
                storm, Instant.now(), Instant.now(), false);
    }

    private static EvaluationInput input(ProfileSnapshot profile, WeatherSnapshot weather,
            Map<String, BigDecimal> config, List<CalibrationRule> rules) {
        return new EvaluationInput(1L, 1L, profile, weather, config, rules);
    }

    private static CalibrationRule rule(Long id, Long profileId,
            WeatherFactor factor, RuleOperator op, BigDecimal threshold,
            String paramKey, CalibrationAction action,
            BigDecimal target, BigDecimal adjustment,
            int priority, String explanation) {
        return new CalibrationRule(
                id, profileId,
                new RuleCondition(factor, op, threshold),
                new RuleAction(paramKey, action, target, adjustment),
                priority, explanation, "1.0", true);
    }

    private static BigDecimal bd(String val) {
        return new BigDecimal(val);
    }
}
