package com.vigilsense.calibration.engine;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public record ProfileSnapshot(
        Long id,
        String code,
        String profileVersion,
        List<String> relevantWeatherFactors,
        Map<String, ParameterSpec> parameters
) {

    public boolean supports(String parameterKey) {
        return parameters.containsKey(parameterKey);
    }

    public boolean considers(String weatherFactor) {
        if (relevantWeatherFactors == null || relevantWeatherFactors.isEmpty()) {
            return true;
        }
        if ("NORMAL".equals(weatherFactor)) {
            return true;
        }
        return relevantWeatherFactors.contains(weatherFactor);
    }

    public Optional<ParameterSpec> parameter(String key) {
        return Optional.ofNullable(parameters.get(key));
    }
}
