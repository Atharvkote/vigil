package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.vigilsense.calibration.rule.RiskLevel;

@Component
public class WeatherImpactAnalyzer {

    public static final BigDecimal HIGH_WIND_MS = new BigDecimal("11.1");
    public static final BigDecimal HIGH_GUST_MS = new BigDecimal("16.7");
    public static final BigDecimal HEAVY_RAIN_MM = new BigDecimal("4.0");

    public WeatherImpact analyze(WeatherSnapshot weather) {
        boolean storm = weather.stormCondition();
        boolean highWind = gte(weather.windSpeedMs(), HIGH_WIND_MS) || gte(weather.windGustMs(), HIGH_GUST_MS);
        boolean heavyRain = gte(weather.rainfallMm(), HEAVY_RAIN_MM);
        boolean normal = !storm && !highWind && !heavyRain;

        RiskLevel risk;
        if (storm || (highWind && heavyRain)) {
            risk = RiskLevel.HIGH;
        } else if (highWind || heavyRain) {
            risk = RiskLevel.MEDIUM;
        } else {
            risk = RiskLevel.LOW;
        }

        List<String> factors = new ArrayList<>();
        if (storm) {
            factors.add("STORM");
        }
        if (highWind) {
            factors.add("HIGH_WIND");
        }
        if (heavyRain) {
            factors.add("HEAVY_RAIN");
        }
        if (normal) {
            factors.add("NORMAL");
        }
        return new WeatherImpact(risk, highWind, heavyRain, storm, normal, List.copyOf(factors));
    }

    private static boolean gte(BigDecimal value, BigDecimal threshold) {
        return value != null && value.compareTo(threshold) >= 0;
    }
}
