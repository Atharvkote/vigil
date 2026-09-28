package com.vigilsense.calibration.engine;

import java.util.List;

import org.springframework.stereotype.Component;

import com.vigilsense.calibration.rule.CalibrationRule;

@Component
public class CalibrationEngine {

    private final WeatherImpactAnalyzer weatherImpactAnalyzer;
    private final RuleEvaluator ruleEvaluator;
    private final RecommendationBuilder recommendationBuilder;

    public CalibrationEngine(
            WeatherImpactAnalyzer weatherImpactAnalyzer,
            RuleEvaluator ruleEvaluator,
            RecommendationBuilder recommendationBuilder) {
        this.weatherImpactAnalyzer = weatherImpactAnalyzer;
        this.ruleEvaluator = ruleEvaluator;
        this.recommendationBuilder = recommendationBuilder;
    }

    public EngineRecommendation evaluate(EvaluationInput input) {
        WeatherImpact impact = weatherImpactAnalyzer.analyze(input.weather());
        List<CalibrationRule> matched = ruleEvaluator.matchingRules(
                input.rules(),
                input.profile(),
                input.weather(),
                impact);
        if (matched.isEmpty()) {
            return recommendationBuilder.maintain(
                    input.profile(),
                    impact,
                    input.currentConfiguration(),
                    "No applicable calibration rule for this sensor profile and weather observation");
        }
        return recommendationBuilder.fromWinningRule(
                matched.get(0),
                matched,
                input.profile(),
                impact,
                input.currentConfiguration());
    }
}
