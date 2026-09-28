package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import com.vigilsense.calibration.rule.CalibrationRule;

public record EvaluationInput(
        Long sensorId,
        Long siteId,
        ProfileSnapshot profile,
        WeatherSnapshot weather,
        Map<String, BigDecimal> currentConfiguration,
        List<CalibrationRule> rules
) {
}
