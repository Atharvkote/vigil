package com.vigilsense.calibration.engine;

import java.util.List;

import com.vigilsense.calibration.rule.RiskLevel;

public record WeatherImpact(
        RiskLevel riskLevel,
        boolean highWind,
        boolean heavyRain,
        boolean storm,
        boolean normal,
        List<String> classifiedFactors
) {
}
