package com.vigilsense.sensor_profile.dto;

import java.math.BigDecimal;

import com.vigilsense.sensor_profile.entity.SensorParameter;

public record SensorParameterResponse(
        Long id,
        String parameterKey,
        String displayName,
        String unit,
        String dataType,
        BigDecimal minValue,
        BigDecimal maxValue,
        BigDecimal defaultValue,
        int sortOrder
) {

    public static SensorParameterResponse from(SensorParameter parameter) {
        return new SensorParameterResponse(
                parameter.getId(),
                parameter.getParameterKey(),
                parameter.getDisplayName(),
                parameter.getUnit(),
                parameter.getDataType(),
                parameter.getMinValue(),
                parameter.getMaxValue(),
                parameter.getDefaultValue(),
                parameter.getSortOrder());
    }
}
