package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Component;

import com.vigilsense.calibration.rule.CalibrationRule;
import com.vigilsense.calibration.rule.RuleCondition;
import com.vigilsense.calibration.rule.RuleOperator;
import com.vigilsense.calibration.rule.WeatherFactor;

@Component
public class RuleEvaluator {

    public List<CalibrationRule> matchingRules(
            List<CalibrationRule> rules,
            ProfileSnapshot profile,
            WeatherSnapshot weather,
            WeatherImpact impact) {
        List<CalibrationRule> matched = new ArrayList<>();
        for (CalibrationRule rule : rules) {
            if (rule == null || !rule.active()) {
                continue;
            }
            if (!profile.supports(rule.action().parameterKey())) {
                continue;
            }
            if (!profile.considers(rule.condition().weatherFactor().name())) {
                continue;
            }
            if (conditionHolds(rule.condition(), weather, impact)) {
                matched.add(rule);
            }
        }
        matched.sort(Comparator.comparingInt(CalibrationRule::priority).reversed());
        return List.copyOf(matched);
    }

    private static boolean conditionHolds(RuleCondition condition, WeatherSnapshot weather, WeatherImpact impact) {
        return switch (condition.weatherFactor()) {
            case STORM -> impact.storm() && flagMatches(condition.operator());
            case NORMAL -> impact.normal() && flagMatches(condition.operator());
            case WIND_SPEED -> compare(weather.windSpeedMs(), condition);
            case WIND_GUST -> compare(weather.windGustMs(), condition);
            case RAINFALL -> compare(weather.rainfallMm(), condition);
            case TEMPERATURE -> compare(weather.temperatureC(), condition);
            case HUMIDITY -> compare(weather.humidityPercent(), condition);
        };
    }

    private static boolean flagMatches(RuleOperator operator) {
        return operator == RuleOperator.IS_TRUE || operator == RuleOperator.EQ;
    }

    private static boolean compare(BigDecimal actual, RuleCondition condition) {
        if (actual == null || condition.threshold() == null) {
            return false;
        }
        int cmp = actual.compareTo(condition.threshold());
        return switch (condition.operator()) {
            case GTE -> cmp >= 0;
            case LTE -> cmp <= 0;
            case EQ -> cmp == 0;
            case IS_TRUE -> false;
        };
    }
}
