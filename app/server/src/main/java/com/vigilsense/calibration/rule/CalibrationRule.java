package com.vigilsense.calibration.rule;

public record CalibrationRule(
        Long id,
        Long sensorProfileId,
        RuleCondition condition,
        RuleAction action,
        int priority,
        String explanation,
        String ruleVersion,
        boolean active
) {
}
