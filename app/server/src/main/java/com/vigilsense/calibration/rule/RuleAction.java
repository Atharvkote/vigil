package com.vigilsense.calibration.rule;

import java.math.BigDecimal;

public record RuleAction(
        String parameterKey,
        CalibrationAction action,
        BigDecimal targetValue,
        BigDecimal adjustmentValue
) {
}
