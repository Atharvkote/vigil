package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record ParameterSpec(
        String parameterKey,
        BigDecimal minValue,
        BigDecimal maxValue,
        BigDecimal defaultValue
) {
}
