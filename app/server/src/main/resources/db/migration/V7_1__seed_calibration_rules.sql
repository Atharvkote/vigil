-- PROJECT ASSUMPTION (not a case-study requirement):
-- Thresholds and target values are engineering defaults for the prototype.
-- Wind 11.1 m/s is ~40 km/h ("high wind"). Rain 4.0 mm is "heavy" for an hourly Open-Meteo precipitation value.
-- Sensitivity targets follow the case-study examples only on profiles that define sensitivity.
-- Other profiles target parameters they actually support (detection_range, beam_threshold, alarm_delay).

-- Fiber-optic fence: sensitivity-like parameter
INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'STORM', 'IS_TRUE', NULL, 'sensitivity', 'SET', 40, NULL, 100,
       'Storm condition detected; lower sensitivity to reduce false alarms', '1.0', TRUE
FROM sensor_profiles WHERE code = 'FIBER_OPTIC_FENCE';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'WIND_SPEED', 'GTE', 11.1, 'sensitivity', 'SET', 50, NULL, 80,
       'High wind speed detected; lower sensitivity', '1.0', TRUE
FROM sensor_profiles WHERE code = 'FIBER_OPTIC_FENCE';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'RAINFALL', 'GTE', 4.0, 'sensitivity', 'SET', 60, NULL, 60,
       'Heavy rain detected; medium sensitivity', '1.0', TRUE
FROM sensor_profiles WHERE code = 'FIBER_OPTIC_FENCE';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'NORMAL', 'IS_TRUE', NULL, 'sensitivity', 'SET', 80, NULL, 10,
       'Normal weather; higher sensitivity', '1.0', TRUE
FROM sensor_profiles WHERE code = 'FIBER_OPTIC_FENCE';

-- Microwave: no sensitivity — target detection_range / alarm_delay
INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'STORM', 'IS_TRUE', NULL, 'detection_range', 'SET', 80, NULL, 100,
       'Storm condition detected; shorten detection range', '1.0', TRUE
FROM sensor_profiles WHERE code = 'MICROWAVE';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'WIND_SPEED', 'GTE', 11.1, 'detection_range', 'SET', 90, NULL, 80,
       'High wind speed detected; shorten detection range', '1.0', TRUE
FROM sensor_profiles WHERE code = 'MICROWAVE';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'RAINFALL', 'GTE', 4.0, 'alarm_delay', 'SET', 8, NULL, 60,
       'Heavy rain detected; increase alarm delay', '1.0', TRUE
FROM sensor_profiles WHERE code = 'MICROWAVE';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'NORMAL', 'IS_TRUE', NULL, 'detection_range', 'SET', 140, NULL, 10,
       'Normal weather; longer detection range', '1.0', TRUE
FROM sensor_profiles WHERE code = 'MICROWAVE';

-- Infrared: no sensitivity and no wind factor on the profile
INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'STORM', 'IS_TRUE', NULL, 'beam_threshold', 'SET', 35, NULL, 100,
       'Storm condition detected; lower beam interruption threshold', '1.0', TRUE
FROM sensor_profiles WHERE code = 'INFRARED_BEAM';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'RAINFALL', 'GTE', 4.0, 'beam_threshold', 'SET', 45, NULL, 60,
       'Heavy rain detected; medium beam interruption threshold', '1.0', TRUE
FROM sensor_profiles WHERE code = 'INFRARED_BEAM';

INSERT INTO calibration_rules (
    sensor_profile_id, weather_factor, operator, threshold, parameter_key,
    action, target_value, adjustment_value, priority, explanation, rule_version, active
)
SELECT id, 'NORMAL', 'IS_TRUE', NULL, 'beam_threshold', 'SET', 65, NULL, 10,
       'Normal weather; higher beam interruption threshold', '1.0', TRUE
FROM sensor_profiles WHERE code = 'INFRARED_BEAM';
