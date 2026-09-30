# V I G I L

**Weather-Based Sensor Calibration Suggestion System**
Software Requirements Specification (SRD/SRS) — Version 1.0 — 27 September 2026

A Spring Boot–based PIDS Weather & Sensor Calibration Recommendation Platform.

> Prepared from the supplied A-1 Launchpad case study and the clarified system concept discussed for implementation.


## Table of Contents

1. [Document Control](#1-document-control)
2. [Executive Summary](#2-executive-summary)
3. [Source Requirements — Case Study Baseline](#3-source-requirements--case-study-baseline)
4. [Problem Statement](#4-problem-statement)
5. [Scope](#5-scope)
6. [Goals and Success Criteria](#6-goals-and-success-criteria)
7. [Users and Actors](#7-users-and-actors)
8. [High-Level System Workflow](#8-high-level-system-workflow)
9. [Functional Requirements](#9-functional-requirements)
10. [Sensor Model and Calibration Concept](#10-sensor-model-and-calibration-concept)
11. [Recommendation Engine](#11-recommendation-engine)
12. [Weather Integration Requirements](#12-weather-integration-requirements)
13. [Dashboard Requirements](#13-dashboard-requirements)
14. [Analytics and Reporting](#14-analytics-and-reporting)
15. [REST API Requirements](#15-rest-api-requirements)
16. [Data Model](#16-data-model)
17. [Non-Functional Requirements](#17-non-functional-requirements)
18. [Proposed Spring Boot Architecture](#18-proposed-spring-boot-architecture)
19. [Proposed Repository Structure](#19-proposed-repository-structure)
20. [Scheduling and Refresh](#20-scheduling-and-refresh)
21. [Error and Edge Cases](#21-error-and-edge-cases)
22. [Recommendation Conflict Handling](#22-recommendation-conflict-handling)
23. [Security and Data Handling](#23-security-and-data-handling)
24. [Testing Requirements](#24-testing-requirements)
25. [Example End-to-End Scenario](#25-example-end-to-end-scenario)
26. [Example Recommendation Payload](#26-example-recommendation-payload)
27. [Assumptions and Clarifications](#27-assumptions-and-clarifications)
28. [Deliverables Checklist](#28-deliverables-checklist)
29. [Acceptance Criteria](#29-acceptance-criteria)
30. [Implementation Roadmap](#30-implementation-roadmap)
31. [Traceability Matrix](#31-traceability-matrix)
32. [Final Design Principle](#32-final-design-principle)


## 1. Document Control

| Item | Value |
|---|---|
| Document | Software Requirements Specification (SRS/SRD) |
| System | VigilSense – Weather-Based Sensor Calibration Suggestion System |
| Version | 1.0 |
| Status | Baseline / Implementation Specification |
| Primary Backend | Java + Spring Boot |
| Primary Database | PostgreSQL |
| Frontend | React + TypeScript (proposed implementation) |
| Weather Source | Open-source weather API (Open-Meteo proposed) |
| Basis | A-1 Launchpad Case Study (2), Weather-Based Sensor Calibration Suggestion System |

## 2. Executive Summary

VigilSense is a software module for a Perimeter Intrusion Detection System (PIDS). The operator creates a monitored site, provides its geographic location, registers the PIDS sensors installed at that site, selects the sensor type/model, and records the sensor's current supported configuration.

The system uses the site's latitude and longitude to retrieve live weather information, analyzes wind speed, rainfall, temperature, humidity, and storm conditions, and then applies a sensor-specific calibration recommendation engine.

The output is not merely a generic HIGH/MEDIUM/LOW label: the system identifies the affected sensor, evaluates its supported configuration parameters, proposes a target configuration/adjustment where the selected sensor profile defines one, and explains the weather-related reason.

The system stores weather observations and recommendations so operators can view history and basic analytics.

## 3. Source Requirements — Case Study Baseline

The supplied case study establishes the following mandatory baseline requirements:

- Purpose: develop a smart module for the Vigil PIDS platform that analyzes environmental conditions using open-source weather data and provides sensor calibration recommendations to operators.
- Integrate an open-source weather API and fetch live weather information.
- Analyze wind speed.
- Analyze rainfall.
- Analyze temperature.
- Analyze humidity.
- Analyze storm conditions.
- Generate sensor sensitivity/calibration recommendations from weather conditions.
- Illustrative relationships explicitly given: high wind → lower sensitivity; normal weather → higher sensitivity; heavy rain → medium sensitivity.
- Display recommendations through a user-friendly operator dashboard.
- Provide basic analytics and reports related to weather conditions and calibration suggestions.
- Provide source code in a GitHub repository.
- Provide project documentation covering architecture, recommendation logic, and setup instructions.
- Provide API integration documentation.
- Provide database schema if applicable.
- Provide a presentation covering the solution, implementation approach, and key features.
- Provide sample data/configuration needed for demonstration.
- Provide a mandatory video demonstration.
- Final submission is a single PDF with the video link included; required filename format is `TeamName_CollegeName_A-1Launchpad_2026.pdf`.
- Third-party libraries, APIs, datasets, and AI tools used must be acknowledged.
- The work must be original team work without plagiarism.

## 4. Problem Statement

Environmental conditions such as strong wind, heavy rainfall, temperature changes, humidity, and storms can affect PIDS operation and may contribute to false intrusion alarms when sensor settings are not appropriately adjusted.

The system shall use site-specific live weather conditions and the characteristics/configuration of the installed sensor to produce an actionable calibration suggestion for an operator.

## 5. Scope

### 5.1 In Scope

- Site creation and geographic location management.
- Registration of one or more sensors under a site.
- Sensor type/model selection and sensor-specific configuration capture.
- Weather retrieval using site coordinates.
- Weather data normalization and storage.
- Weather condition/risk analysis.
- Sensor-specific calibration recommendation generation.
- Recommendation explanation and affected-factor display.
- Operator dashboard.
- Historical weather and recommendation views.
- Basic analytics and reports.
- REST APIs.
- Database persistence.
- API documentation and project documentation.
- Demonstration/sample configuration.

### 5.2 Explicitly Not Assumed by the Case Study

- The case study does not define a specific physical PIDS sensor technology.
- It does not define a universal sensor parameter set applicable to every sensor.
- It does not require direct hardware actuation or automatic writing of settings to physical sensor hardware.
- It does not prescribe a particular ML algorithm.
- It does not require authentication, microservices, Kafka, Redis, Kubernetes, or other infrastructure components.

Therefore, sensor-specific parameters and profiles in this SRS are implementation extensions. They must be documented as assumptions and must not be presented as requirements supplied by the case study.

## 6. Goals and Success Criteria

- An operator can create a site and store its coordinates.
- The system can obtain live weather data for that exact site.
- The system analyzes all five required weather categories.
- The system can distinguish different registered sensor types/models.
- The recommendation engine does not blindly apply one generic configuration to all sensors.
- Each recommendation identifies the sensor, current configuration (where applicable), recommended action/target, and reason.
- The dashboard makes the recommendation understandable to an operator.
- Weather and recommendation history is persisted for analytics.
- The complete system can be demonstrated using reproducible sample sites, sensors, and weather data.

## 7. Users and Actors

| Actor | Responsibilities |
|---|---|
| Operator | Create/manage sites; register sensors; enter/verify sensor configuration; view weather; review and acknowledge recommendations; inspect history and analytics. |
| System Administrator (optional extension) | Manage sensor-type profiles, supported parameters, rule versions, and system configuration. |
| Weather API | External source providing live environmental data for a site's coordinates. |
| Calibration Recommendation Engine | Analyzes weather + sensor profile + current configuration and produces an explainable recommendation. |

## 8. High-Level System Workflow

The required business flow is:

1. Create Site
2. Enter Latitude/Longitude
3. Add Sensors
4. Select Sensor Type/Model
5. Enter Current Supported Configuration
6. Fetch Live Weather for Site
7. Analyze Weather
8. Apply Sensor-Specific Calibration Rules
9. Generate Recommendation
10. Display to Operator
11. Persist Result
12. Provide History/Analytics

**Key principle:** weather belongs to the SITE location; calibration belongs to the SENSOR installed at that site.

## 9. Functional Requirements

| ID | Requirement | Description |
|---|---|---|
| FR-001 | Site creation | System shall allow an operator to create a site with name and geographic location. |
| FR-002 | Site coordinates | System shall store latitude and longitude for each site and use them as the primary weather lookup coordinates. |
| FR-003 | Site management | System shall allow viewing and editing site details. |
| FR-004 | Sensor registration | System shall allow multiple sensors to be registered under one site. |
| FR-005 | Sensor type | Operator shall select/enter the type of sensor used at the site. |
| FR-006 | Sensor model | Operator shall record manufacturer/model when available; model may be marked unknown for a prototype. |
| FR-007 | Installation details | System shall capture sensor name/identifier and installation location/zone within the site. |
| FR-008 | Configuration schema | System shall present configuration fields appropriate to the selected sensor profile rather than assuming all sensors share the same settings. |
| FR-009 | Current configuration | Operator shall record the current sensor configuration for supported parameters. |
| FR-010 | Weather lookup | System shall retrieve live weather using the site's latitude/longitude. |
| FR-011 | Wind | System shall obtain/analyze wind speed; wind gust should be retained when the API supplies it. |
| FR-012 | Rainfall | System shall obtain/analyze rainfall/precipitation. |
| FR-013 | Temperature | System shall obtain/analyze temperature. |
| FR-014 | Humidity | System shall obtain/analyze humidity. |
| FR-015 | Storm | System shall determine storm/thunderstorm conditions from the weather provider's weather classification/code or equivalent. |
| FR-016 | Weather timestamp | System shall store the observation timestamp and provider/source metadata. |
| FR-017 | Weather normalization | System shall convert provider data into a common internal weather model and units. |
| FR-018 | Weather risk | System shall derive an environmental risk/impact level using configurable rules. |
| FR-019 | Sensor-specific analysis | System shall evaluate weather conditions against the selected sensor type/model profile. |
| FR-020 | Calibration recommendation | System shall produce a recommended calibration/configuration action for the selected sensor. |
| FR-021 | Recommendation rationale | System shall provide the factors/reasons that led to the recommendation. |
| FR-022 | Sensitivity mapping | Where the sensor profile exposes a sensitivity-like parameter, system shall map the recommendation to an appropriate target/range. Where it does not, system shall recommend only parameters actually defined for that sensor profile. |
| FR-023 | Case-study sensitivity examples | Rules shall support the supplied baseline relationships: high wind → lower sensitivity; normal weather → higher sensitivity; heavy rain → medium sensitivity. |
| FR-024 | No unsupported parameters | System shall not display or recommend a parameter that is not defined as supported by the selected sensor profile. |
| FR-025 | Operator dashboard | System shall display site, sensor, weather, risk, current configuration, recommendation, and rationale. |
| FR-026 | Historical weather | System shall persist weather observations associated with the site. |
| FR-027 | Recommendation history | System shall persist calibration recommendations associated with the sensor and weather observation. |
| FR-028 | Analytics | System shall provide basic weather and calibration analytics. |
| FR-029 | Reports | System shall provide basic report views/export-ready summaries of weather conditions and calibration suggestions. |
| FR-030 | Failure handling | System shall report when weather retrieval fails, is stale, or lacks required variables. |
| FR-031 | Manual refresh | Operator shall be able to request a fresh weather/recommendation evaluation. |
| FR-032 | Scheduled refresh | System may periodically refresh weather and recommendations; the interval shall be configurable. |
| FR-033 | Recommendation state | System should record generated/acknowledged/applied status without implying that physical hardware was changed. |
| FR-034 | Auditability | System shall retain when a recommendation was generated, for which sensor, from which weather observation, and which rule/profile version produced it. |

## 10. Sensor Model and Calibration Concept

The system shall not assume that every PIDS sensor has a generic "sensitivity" control. Instead, a Sensor Type/Profile defines which configuration parameters exist for that sensor and which weather factors are relevant. The case study's HIGH/MEDIUM/LOW sensitivity examples become a general recommendation concept; a concrete target parameter is emitted only when the selected sensor profile supports it.

### 10.1 Proposed Sensor Profile Structure

| Field | Purpose |
|---|---|
| Sensor Type | Logical type/category selected by operator. |
| Manufacturer / Model | Identifies the real or demonstration sensor. |
| Supported Parameters | Configuration parameters that can legitimately be recommended. |
| Parameter Unit / Range | Defines valid values and units. |
| Weather Factors | Weather variables that affect the profile. |
| Rule Set | Conditions and adjustments for the profile. |
| Explanation Templates | Human-readable reason for recommendations. |
| Profile Version | Allows recommendation auditability when rules change. |

### 10.2 Sensor Types

The case study does not prescribe sensor types. For the prototype, the team shall choose a documented set of PIDS-relevant sensor profiles. Examples may include vibration/fence, fiber-optic fence, microwave, infrared beam, or another documented PIDS sensor. Only parameters supported by the selected prototype profile shall be implemented. A generic "sensitivity" field shall not be assumed for all types.

## 11. Recommendation Engine

The recommendation engine shall be explainable and deterministic in the baseline implementation.

### 11.1 Inputs

- Site weather observation.
- Sensor type and model/profile.
- Current sensor configuration.
- Configured calibration rules.
- Rule/profile version.

### 11.2 Processing

1. Validate weather freshness and required variables.
2. Normalize units.
3. Classify weather conditions.
4. Calculate environmental impact/risk.
5. Load the sensor profile.
6. Identify supported configuration parameters.
7. Evaluate weather-specific rules for that sensor.
8. Compare current configuration with the recommended target/range.
9. Produce action, target, reasons, confidence/priority if used, and limitations.
10. Persist the recommendation.

### 11.3 Output

| Output | Description |
|---|---|
| Risk/Impact | LOW, MEDIUM, HIGH or equivalent documented scale. |
| Recommended Action | Increase, decrease, maintain, or adjust a supported parameter. |
| Target/Range | Recommended value/range when defined by the sensor profile. |
| Affected Parameter | The actual configuration parameter being recommended. |
| Current Value | Existing operator-provided configuration. |
| Reason(s) | Weather factors responsible for the recommendation. |
| Weather Snapshot | Values used to generate the recommendation. |
| Profile/Rule Version | Version used for traceability. |

**Example:** High wind may lead to a lower sensitivity recommendation for a sensor profile whose configuration includes sensitivity. Heavy rain may lead to a medium sensitivity recommendation as explicitly illustrated in the case study. These mappings must be calibrated/validated for the chosen prototype sensor profile and documented as project assumptions.

## 12. Weather Integration Requirements

- Use an open-source weather API.
- Proposed provider: Open-Meteo.
- Weather request shall be generated from the stored site's latitude and longitude.
- Required internal variables: temperature, relative humidity, precipitation/rainfall, wind speed, and storm/weather classification.
- Wind gust may be retained as an additional factor.
- Store source, retrieval time, observation time, coordinates, and raw/provider weather code where practical.
- Handle API timeout, HTTP errors, malformed responses, missing variables, rate limits, and stale data.
- Do not allow an old weather response to appear as current without a timestamp/freshness indicator.

## 13. Dashboard Requirements

- Site list with current weather/recommendation status.
- Site detail view.
- Sensor list per site.
- Sensor configuration view.
- Current weather cards.
- Environmental risk/impact indicator.
- Sensor-specific calibration recommendation.
- Current vs recommended configuration comparison.
- Reasons/explanation.
- Weather history charts.
- Calibration recommendation history.
- Basic analytics.
- Manual refresh control.
- Data freshness timestamp.
- Clear indication when a recommendation is informational and has not been physically applied to hardware.

## 14. Analytics and Reporting

- Average/min/max temperature over a selected period.
- Wind-speed statistics.
- Rainfall totals/period statistics.
- Humidity statistics.
- Storm occurrence/count.
- Weather-risk distribution.
- Count of recommendations by sensor/site.
- Count of recommendation actions by parameter.
- Current vs recommended adjustment history where available.
- Weather conditions associated with recommendations.
- Time-series trend charts.
- Date/site/sensor filters.
- Report-ready summary.

## 15. REST API Requirements

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/v1/sites` | Create site. |
| GET | `/api/v1/sites` | List sites. |
| GET | `/api/v1/sites/{siteId}` | Get site. |
| PUT | `/api/v1/sites/{siteId}` | Update site. |
| DELETE | `/api/v1/sites/{siteId}` | Delete site if permitted. |
| POST | `/api/v1/sites/{siteId}/sensors` | Register sensor. |
| GET | `/api/v1/sites/{siteId}/sensors` | List site sensors. |
| GET | `/api/v1/sensors/{sensorId}` | Get sensor and configuration. |
| PUT | `/api/v1/sensors/{sensorId}` | Update sensor/configuration. |
| GET | `/api/v1/sites/{siteId}/weather/current` | Fetch/current stored weather for site. |
| POST | `/api/v1/sites/{siteId}/weather/refresh` | Request fresh weather retrieval. |
| GET | `/api/v1/sites/{siteId}/weather/history` | Weather history. |
| GET | `/api/v1/sensors/{sensorId}/calibration/current` | Current recommendation. |
| POST | `/api/v1/sensors/{sensorId}/calibration/evaluate` | Generate/recalculate recommendation. |
| GET | `/api/v1/sensors/{sensorId}/calibration/history` | Recommendation history. |
| GET | `/api/v1/sites/{siteId}/analytics` | Site analytics. |
| GET | `/api/v1/sites/{siteId}/reports` | Report-ready summary. |

Exact endpoint payloads shall be documented using OpenAPI/Swagger.

## 16. Data Model

| Entity | Key Fields |
|---|---|
| Site | id, name, address/location label, latitude, longitude, createdAt, updatedAt |
| Sensor | id, siteId, name/identifier, sensorTypeId, manufacturer, model, installationZone, status, createdAt, updatedAt |
| SensorTypeProfile | id, name, description, manufacturer/model scope, profileVersion, active |
| SensorParameter | id, profileId, name, unit, dataType, min, max, default/normal range |
| SensorConfiguration | id, sensorId, parameterId, currentValue, capturedAt |
| WeatherRecord | id, siteId, latitude, longitude, temperature, humidity, precipitation, windSpeed, windGust, weatherCode, observedAt, retrievedAt, source |
| CalibrationRecommendation | id, sensorId, weatherRecordId, riskLevel, affectedParameter, currentValue, recommendedValue/range, action, reasons, profileVersion, ruleVersion, status, createdAt |
| CalibrationRule | id, profileId, weatherFactor, operator/condition, parameter, adjustment/target, priority, explanation, ruleVersion, active |

**Entity relationship:** `Site (1) → (N) Sensor`, `Site (1) → (N) WeatherRecord`, `Sensor (1) → (N) SensorConfiguration`, `Sensor (1) → (N) CalibrationRecommendation`, `WeatherRecord (1) → (N) CalibrationRecommendation`, `SensorTypeProfile (1) → (N) SensorParameter`, `SensorTypeProfile (1) → (N) CalibrationRule`.

## 17. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-001 | Performance | Normal API operations should respond promptly; external weather latency shall be isolated and timeouts configured. |
| NFR-002 | Reliability | Weather-provider failures shall not crash the application; the system shall surface stale/unavailable status. |
| NFR-003 | Explainability | Every recommendation shall be traceable to weather inputs and a sensor profile/rule. |
| NFR-004 | Maintainability | Use layered Spring Boot architecture with controller/service/repository/client separation. |
| NFR-005 | Configurability | Weather provider URL, refresh interval, thresholds, and profiles/rules should be configurable. |
| NFR-006 | Validation | Coordinates, sensor configuration values, required fields, and enum/profile values shall be validated. |
| NFR-007 | Data integrity | Foreign keys and constraints shall maintain Site → Sensor → Weather/Recommendation relationships. |
| NFR-008 | Security | API input shall be validated and secrets shall be externalized; authentication may be added if required by deployment. |
| NFR-009 | Observability | Application logs shall capture weather retrieval and recommendation failures without exposing secrets. |
| NFR-010 | Testability | Core recommendation rules shall be unit-testable independently of the weather API. |
| NFR-011 | Documentation | OpenAPI, setup instructions, architecture, recommendation logic, and database schema shall be documented. |
| NFR-012 | Portability | Application should run locally using Java, PostgreSQL, and documented configuration; Docker is recommended. |

## 18. Proposed Spring Boot Architecture

Controller → Service → Domain/Rule Engine → Repository/External Client is the primary flow. The weather API is isolated behind a client interface. The calibration engine is isolated from persistence and HTTP so that rules can be unit-tested.

- `controller` — REST endpoints.
- `service` — site, sensor, weather, calibration, analytics orchestration.
- `client` — Open-Meteo/external weather API client.
- `domain` / `rules` — weather classification and sensor-specific recommendation logic.
- `entity` — JPA persistence models.
- `repository` — Spring Data JPA repositories.
- `dto` — request/response contracts.
- `config` — RestClient, scheduling, API, database configuration.
- `exception` — global exception handler and structured error responses.

## 19. Proposed Repository Structure

```
vigil-sense/
├── src/main/java/com/vigilsense/
│   ├── controller/
│   ├── service/
│   ├── client/
│   ├── rules/
│   ├── entity/
│   ├── repository/
│   ├── dto/
│   ├── model/
│   ├── config/
│   └── exception/
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/
├── src/test/
├── frontend/
├── Dockerfile
├── docker-compose.yml
├── README.md
└── docs/
```

## 20. Scheduling and Refresh

- Provide manual weather refresh.
- Provide optional scheduled refresh.
- Store every accepted weather observation with timestamps.
- Generate a recommendation for sensors affected by a refreshed weather observation.
- Scheduling interval shall be configurable.
- Prevent duplicate processing of identical observations where practical.

## 21. Error and Edge Cases

- Invalid latitude/longitude.
- Site without coordinates.
- Site with no sensors.
- Sensor type not configured.
- Sensor model unknown.
- Sensor profile has no relevant calibration parameter.
- Weather API unavailable.
- Weather API returns partial data.
- Weather data is stale.
- Storm/weather code cannot be classified.
- Rainfall value unavailable.
- Duplicate sensor identifier within a site.
- Configuration value outside supported sensor parameter range.
- Conflicting weather factors.
- Recommendation cannot be produced because required sensor information is missing.
- Historical data contains gaps.

## 22. Recommendation Conflict Handling

When multiple weather factors produce different recommendations, the engine shall use a documented priority/aggregation strategy. For example, a storm condition may take precedence over normal-weather logic, while multiple moderate factors may combine into a higher environmental impact. The exact thresholds and priority rules are implementation parameters and shall be versioned and documented.

## 23. Security and Data Handling

- Validate all incoming request data.
- Do not commit API keys/secrets to GitHub.
- Use environment variables/application configuration for secrets.
- Restrict CORS to configured frontend origins in deployment.
- Use parameterized/JPA queries.
- Log failures without logging credentials.
- Use HTTPS in production deployment.
- If authentication is introduced, protect site/sensor/configuration operations with appropriate roles.

## 24. Testing Requirements

| Test Area | Required Coverage |
|---|---|
| Site | Create, validation, coordinates, update. |
| Sensor | Registration, type/profile validation, configuration validation. |
| Weather client | Successful response, timeout, HTTP failure, malformed/partial response. |
| Weather analysis | Wind/rain/temperature/humidity/storm classifications. |
| Calibration engine | Normal weather, high wind, heavy rain, storm, combined factors, unsupported parameter. |
| API | Request/response contracts, validation, error responses. |
| Persistence | Entity relationships and historical records. |
| Analytics | Correct aggregation for representative data. |
| Frontend | Dashboard states, stale/unavailable weather, recommendation display. |

## 25. Example End-to-End Scenario

1. Operator creates "Industrial Site A" with latitude and longitude.
2. Operator adds "North Fence Sensor 01".
3. Operator selects the sensor type/profile and records its current supported parameters.
4. Backend requests current weather using Site A coordinates.
5. Weather response contains wind speed, rainfall, temperature, humidity, and weather/storm code.
6. Weather engine classifies environmental impact.
7. Calibration engine loads North Fence Sensor 01's profile.
8. Engine evaluates only parameters supported by that profile.
9. System produces a recommendation with action, target/range where supported, reasons, and rule/profile version.
10. Dashboard shows the recommendation alongside the weather snapshot.
11. Operator may acknowledge/review it; the system records status but does not claim physical hardware was changed.
12. Weather and recommendation are retained for history and analytics.

## 26. Example Recommendation Payload

```json
{
  "sensorId": 101,
  "siteId": 1,
  "riskLevel": "HIGH",
  "weather": {
    "temperature": 31.4,
    "humidity": 86,
    "rainfall": 8.2,
    "windSpeed": 46.0,
    "storm": false
  },
  "currentConfiguration": {
    "parameter": "sensitivity",
    "value": 70
  },
  "recommendation": {
    "action": "DECREASE",
    "parameter": "sensitivity",
    "target": 50
  },
  "reasons": [
    "High wind speed detected",
    "Rainfall detected"
  ],
  "profileVersion": "1.0",
  "ruleVersion": "1.0"
}
```

## 27. Assumptions and Clarifications

- The case study's required weather variables and example sensitivity relationships are authoritative for the project baseline.
- The case study does not define physical sensor types or their exact calibration parameters.
- The project therefore introduces a sensor-profile abstraction so that the operator selects the actual sensor type/model and the system only recommends supported parameters.
- A normalized sensitivity concept may be used for prototype profiles, but it must be clearly documented as an application-level abstraction.
- Automatic hardware application is outside the baseline unless a real sensor integration is separately implemented.
- Thresholds/ranges for specific sensor profiles are engineering assumptions and require documentation/validation for the selected prototype sensors.
- Open-Meteo is a proposed open-source weather provider; the provider can be replaced through an adapter if necessary.

## 28. Deliverables Checklist

| Deliverable | Status/Requirement |
|---|---|
| Source code | Mandatory – GitHub repository. |
| Project documentation | Mandatory – architecture, recommendation logic, setup. |
| API integration documentation | Mandatory. |
| Database schema | Mandatory if database is used; this project uses PostgreSQL. |
| Presentation | Mandatory. |
| Sample data/configuration | Mandatory for demonstration. |
| Video demonstration | Mandatory; link included in final PDF. |
| Final PDF | Mandatory; single PDF submission. |
| PDF filename | `TeamName_CollegeName_A-1Launchpad_2026.pdf` |
| Third-party acknowledgements | Mandatory for libraries/APIs/datasets/AI tools. |
| Original work | Mandatory; no plagiarism. |

## 29. Acceptance Criteria

- **AC-01:** Operator can create a site with valid coordinates.
- **AC-02:** System retrieves live weather for the site's coordinates.
- **AC-03:** Dashboard displays wind, rainfall, temperature, humidity, and storm condition.
- **AC-04:** Operator can register multiple sensors under the site.
- **AC-05:** Operator can select a sensor type/profile and enter its current supported configuration.
- **AC-06:** Recommendation engine uses sensor profile + weather rather than applying one universal sensor configuration.
- **AC-07:** High-wind conditions produce a lower-sensitivity recommendation where the selected profile supports sensitivity, consistent with the case-study example.
- **AC-08:** Normal weather produces a higher-sensitivity recommendation where the selected profile supports sensitivity, consistent with the case-study example.
- **AC-09:** Heavy-rain conditions produce a medium-sensitivity recommendation where the selected profile supports sensitivity, consistent with the case-study example.
- **AC-10:** Recommendation explains the weather factors responsible.
- **AC-11:** Unsupported sensor parameters are not recommended.
- **AC-12:** Weather and recommendation history can be retrieved.
- **AC-13:** Basic analytics and report summaries are available.
- **AC-14:** API failures/stale data are clearly handled.
- **AC-15:** Documentation and demonstration artifacts can be produced from the implemented system.

## 30. Implementation Roadmap

| Phase | Work |
|---|---|
| Phase 1 | Spring Boot project, PostgreSQL, Site entity/API. |
| Phase 2 | Sensor registration, sensor profiles, dynamic configuration model. |
| Phase 3 | Weather API client and weather persistence. |
| Phase 4 | Weather analysis and rule engine. |
| Phase 5 | Sensor-specific calibration recommendation engine. |
| Phase 6 | Dashboard and operator workflow. |
| Phase 7 | History, analytics, reports. |
| Phase 8 | Validation, testing, Swagger, Docker, documentation. |
| Phase 9 | Optional ML enhancement if it adds measurable value and is documented separately from baseline rules. |
| Phase 10 | Demo script, presentation, final PDF, and video link. |

## 31. Traceability Matrix

| Case Study Requirement | SRS Coverage |
|---|---|
| Live open-source weather API | FR-010 to FR-017; Section 12 |
| Wind speed | FR-011 |
| Rainfall | FR-012 |
| Temperature | FR-013 |
| Humidity | FR-014 |
| Storm conditions | FR-015 |
| Calibration recommendations | FR-019 to FR-024; Section 11 |
| High wind → lower sensitivity | FR-023; Acceptance AC-07 |
| Normal weather → higher sensitivity | FR-023; Acceptance AC-08 |
| Heavy rain → medium sensitivity | FR-023; Acceptance AC-09 |
| Operator dashboard | FR-025; Section 13 |
| Analytics/reports | FR-028/FR-029; Section 14 |
| GitHub source code | Section 28 |
| Architecture/recommendation/setup documentation | Sections 18–20 and 28 |
| API integration documentation | Sections 15 and 28 |
| Database schema | Section 16 and 28 |
| Presentation | Section 28 |
| Sample data/configuration | Section 28 |
| Mandatory video | Section 28 |
| Single PDF + video link | Section 28 |
| Third-party acknowledgements | Section 28 |

## 32. Final Design Principle

> VigilSense shall be site-driven and sensor-aware. The site's geographic location determines which weather is fetched. The registered sensor determines which configuration parameters can be evaluated. The weather condition and sensor profile together determine the recommendation. Therefore, the system does not assume that every sensor has a generic sensitivity control, and it does not claim to physically calibrate hardware unless a concrete hardware integration is separately implemented.


*End of Software Requirements Specification.*
