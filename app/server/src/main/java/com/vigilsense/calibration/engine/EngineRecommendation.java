package com.vigilsense.calibration.engine;

import java.math.BigDecimal;
import java.util.List;

import com.vigilsense.calibration.rule.CalibrationAction;
import com.vigilsense.calibration.rule.RiskLevel;

public record EngineRecommendation(
        RiskLevel riskLevel,
        String affectedParameter,
        BigDecimal currentValue,
        BigDecimal recommendedValue,
        BigDecimal recommendedMin,
        BigDecimal recommendedMax,
        CalibrationAction action,
        List<String> reasons,
        String profileVersion,
        String ruleVersion
) {
}
