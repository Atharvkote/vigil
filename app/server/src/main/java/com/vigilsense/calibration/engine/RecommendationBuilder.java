package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.vigilsense.calibration.rule.CalibrationAction;
import com.vigilsense.calibration.rule.CalibrationRule;
import com.vigilsense.calibration.rule.RiskLevel;

@Component
public class RecommendationBuilder {

    public EngineRecommendation fromWinningRule(
            CalibrationRule winning,
            List<CalibrationRule> matched,
            ProfileSnapshot profile,
            WeatherImpact impact,
            Map<String, BigDecimal> currentConfiguration) {
        ParameterSpec spec = profile.parameter(winning.action().parameterKey()).orElseThrow();
        BigDecimal current = currentValue(spec, currentConfiguration);
        BigDecimal recommended = resolveTarget(winning, spec, current);
        CalibrationAction action = deriveAction(winning.action().action(), current, recommended);
        List<String> reasons = new ArrayList<>();
        matched.forEach(rule -> reasons.add(rule.explanation()));
        if (impact.classifiedFactors().size() > 1 && !impact.normal()) {
            reasons.add("Combined weather factors classified as " + impact.riskLevel() + " environmental impact");
        }
        return new EngineRecommendation(
                impact.riskLevel(),
                spec.parameterKey(),
                current,
                recommended,
                spec.minValue(),
                spec.maxValue(),
                action,
                List.copyOf(reasons),
                profile.profileVersion(),
                winning.ruleVersion());
    }

    public EngineRecommendation maintain(
            ProfileSnapshot profile,
            WeatherImpact impact,
            Map<String, BigDecimal> currentConfiguration,
            String reason) {
        String parameter = profile.parameters().keySet().stream().sorted().findFirst().orElse(null);
        BigDecimal current = null;
        BigDecimal min = null;
        BigDecimal max = null;
        if (parameter != null) {
            ParameterSpec spec = profile.parameters().get(parameter);
            current = currentValue(spec, currentConfiguration);
            min = spec.minValue();
            max = spec.maxValue();
        }
        return new EngineRecommendation(
                impact.riskLevel(),
                parameter,
                current,
                current,
                min,
                max,
                CalibrationAction.MAINTAIN,
                List.of(reason),
                profile.profileVersion(),
                "none");
    }

    static BigDecimal resolveTarget(CalibrationRule rule, ParameterSpec spec, BigDecimal current) {
        BigDecimal target = switch (rule.action().action()) {
            case SET -> rule.action().targetValue();
            case INCREASE, DECREASE -> {
                BigDecimal adjustment = rule.action().adjustmentValue() == null
                        ? BigDecimal.ZERO
                        : rule.action().adjustmentValue();
                BigDecimal base = current != null ? current : defaultOrZero(spec);
                yield rule.action().action() == CalibrationAction.INCREASE
                        ? base.add(adjustment)
                        : base.subtract(adjustment);
            }
            case MAINTAIN -> current;
        };
        return clamp(target, spec);
    }

    private static CalibrationAction deriveAction(
            CalibrationAction requested,
            BigDecimal current,
            BigDecimal recommended) {
        if (requested == CalibrationAction.MAINTAIN || recommended == null || current == null) {
            if (requested == CalibrationAction.SET && current != null && recommended != null) {
                int cmp = recommended.compareTo(current);
                if (cmp > 0) {
                    return CalibrationAction.INCREASE;
                }
                if (cmp < 0) {
                    return CalibrationAction.DECREASE;
                }
                return CalibrationAction.MAINTAIN;
            }
            return requested == CalibrationAction.SET ? CalibrationAction.MAINTAIN : requested;
        }
        int cmp = recommended.compareTo(current);
        if (cmp > 0) {
            return CalibrationAction.INCREASE;
        }
        if (cmp < 0) {
            return CalibrationAction.DECREASE;
        }
        return CalibrationAction.MAINTAIN;
    }

    private static BigDecimal currentValue(ParameterSpec spec, Map<String, BigDecimal> currentConfiguration) {
        BigDecimal configured = currentConfiguration.get(spec.parameterKey());
        if (configured != null) {
            return configured;
        }
        return spec.defaultValue();
    }

    private static BigDecimal defaultOrZero(ParameterSpec spec) {
        return spec.defaultValue() != null ? spec.defaultValue() : BigDecimal.ZERO;
    }

    private static BigDecimal clamp(BigDecimal value, ParameterSpec spec) {
        if (value == null) {
            return null;
        }
        BigDecimal result = value;
        if (spec.minValue() != null && result.compareTo(spec.minValue()) < 0) {
            result = spec.minValue();
        }
        if (spec.maxValue() != null && result.compareTo(spec.maxValue()) > 0) {
            result = spec.maxValue();
        }
        return result;
    }
}
