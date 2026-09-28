-- PROJECT ASSUMPTION (not a case-study requirement):
-- The A-1 case study does not define physical PIDS types or parameter sets.
-- These three profiles are demonstration seeds so operators can select a type
-- and the engine only recommends parameters that type actually supports.
-- Seeded via Flyway (this file) rather than a separate runtime script so a
-- fresh database is demo-ready after migrate.

INSERT INTO sensor_profiles (
    code, name, description, manufacturer_scope, model_scope,
    profile_version, relevant_weather_factors, active
) VALUES
(
    'FIBER_OPTIC_FENCE',
    'Fiber-optic fence sensor',
    'Fence-mounted fiber-optic disturbance sensor. Supports a sensitivity-like gain and an alarm threshold.',
    'Generic / demonstration',
    'FO-FENCE-DEMO',
    '1.0',
    'WIND_SPEED,RAINFALL,TEMPERATURE,HUMIDITY,STORM',
    TRUE
),
(
    'MICROWAVE',
    'Microwave barrier sensor',
    'Bistatic microwave detection. Does not expose sensitivity; range and alarm delay are the configurable parameters.',
    'Generic / demonstration',
    'MW-BARRIER-DEMO',
    '1.0',
    'WIND_SPEED,RAINFALL,HUMIDITY,STORM',
    TRUE
),
(
    'INFRARED_BEAM',
    'Infrared beam sensor',
    'Active infrared beam pair. Beam interruption threshold and alarm delay are supported; there is no sensitivity control.',
    'Generic / demonstration',
    'IR-BEAM-DEMO',
    '1.0',
    'RAINFALL,TEMPERATURE,HUMIDITY,STORM',
    TRUE
);

INSERT INTO sensor_parameters (
    sensor_profile_id, parameter_key, display_name, unit, data_type,
    min_value, max_value, default_value, sort_order
)
SELECT id, 'sensitivity', 'Sensitivity', 'percent', 'DECIMAL', 0, 100, 70, 1
FROM sensor_profiles WHERE code = 'FIBER_OPTIC_FENCE';

INSERT INTO sensor_parameters (
    sensor_profile_id, parameter_key, display_name, unit, data_type,
    min_value, max_value, default_value, sort_order
)
SELECT id, 'alarm_threshold', 'Alarm threshold', 'percent', 'DECIMAL', 0, 100, 45, 2
FROM sensor_profiles WHERE code = 'FIBER_OPTIC_FENCE';

INSERT INTO sensor_parameters (
    sensor_profile_id, parameter_key, display_name, unit, data_type,
    min_value, max_value, default_value, sort_order
)
SELECT id, 'detection_range', 'Detection range', 'm', 'DECIMAL', 10, 300, 120, 1
FROM sensor_profiles WHERE code = 'MICROWAVE';

INSERT INTO sensor_parameters (
    sensor_profile_id, parameter_key, display_name, unit, data_type,
    min_value, max_value, default_value, sort_order
)
SELECT id, 'alarm_delay', 'Alarm delay', 's', 'INTEGER', 0, 30, 3, 2
FROM sensor_profiles WHERE code = 'MICROWAVE';

INSERT INTO sensor_parameters (
    sensor_profile_id, parameter_key, display_name, unit, data_type,
    min_value, max_value, default_value, sort_order
)
SELECT id, 'beam_threshold', 'Beam interruption threshold', 'percent', 'DECIMAL', 0, 100, 50, 1
FROM sensor_profiles WHERE code = 'INFRARED_BEAM';

INSERT INTO sensor_parameters (
    sensor_profile_id, parameter_key, display_name, unit, data_type,
    min_value, max_value, default_value, sort_order
)
SELECT id, 'alarm_delay', 'Alarm delay', 's', 'INTEGER', 0, 15, 2, 2
FROM sensor_profiles WHERE code = 'INFRARED_BEAM';
