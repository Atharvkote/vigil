package com.vigilsense.calibration.rule;

import java.math.BigDecimal;

public record RuleCondition(
        WeatherFactor weatherFactor,
        RuleOperator operator,
        BigDecimal threshold
) {
}
