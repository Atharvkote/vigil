# VigilSense REST API Specification

**Version**: 1.0.0  
**Base URL**: `http://localhost:8081/api/v1`  
**Content-Type**: `application/json`  
**Default Port**: `8081`

---

## 📑 Table of Contents

- [Overview & Response Envelope](#overview--response-envelope)
- [Error Handling & Status Codes](#error-handling--status-codes)
- [1. Health & System Diagnostics](#1-health--system-diagnostics)
- [2. Sites Management API](#2-sites-management-api)
- [3. Sensors & Fleet Registry API](#3-sensors--fleet-registry-api)
- [4. Sensor Profiles & Parameter Boundaries API](#4-sensor-profiles--parameter-boundaries-api)
- [5. Atmospheric Weather Telemetry API](#5-atmospheric-weather-telemetry-api)
- [6. Sensor Calibration & Recommendation API](#6-sensor-calibration--recommendation-api)
- [7. Analytics & Tactical Reporting API](#7-analytics--tactical-reporting-api)

---

## Overview & Response Envelope

All API endpoints return responses encapsulated in a standardized JSON envelope (`ApiResponse<T>`):

### Standard Success Envelope
```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

### Standard Error Envelope
```json
{
  "success": false,
  "message": "Error description or failure reason",
  "data": null
}
```

---

## Error Handling & Status Codes

| HTTP Status | Description | Scenario |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | Standard retrieval or update operations |
| `201 CREATED` | Resource created | Creation of site, sensor, or newly evaluated calibration |
| `204 NO CONTENT` | Action executed cleanly | Deletion of site |
| `400 BAD REQUEST` | Validation error | Missing required fields, out-of-range coordinates, or invalid parameters |
| `404 NOT FOUND` | Resource not found | Site ID or Sensor ID does not exist |
| `503 SERVICE UNAVAILABLE` | Upstream failure | Open-Meteo external weather API connection timeout or unreachable |
| `500 INTERNAL SERVER ERROR` | Unhandled error | Unexpected backend exception |

### Validation Error Example (`400 Bad Request`)
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "latitude": "latitude must be between -90 and 90",
    "name": "name is required"
  }
}
```

---

## 1. Health & System Diagnostics

### 1.1 Health Check
Checks backend service availability and connectivity.

- **Method**: `GET`
- **Path**: `/health`
- **Authentication**: None

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/health
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "status": "UP"
  }
}
```

---

## 2. Sites Management API

### 2.1 List All Monitored Sites
Retrieves all monitored facilities, perimeter geographic coordinates, and metadata.

- **Method**: `GET`
- **Path**: `/sites`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sites
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "name": "Mumbai Refinery Facility",
      "locationLabel": "Trombay Terminal, Maharashtra, India",
      "latitude": 19.0760,
      "longitude": 72.8777,
      "createdAt": "2026-09-27T08:00:00Z",
      "updatedAt": "2026-09-27T08:00:00Z"
    },
    {
      "id": 2,
      "name": "Delhi High-Security Data Center",
      "locationLabel": "NCR Cyber Park, New Delhi, India",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "createdAt": "2026-09-27T08:15:00Z",
      "updatedAt": "2026-09-27T08:15:00Z"
    }
  ]
}
```

---

### 2.2 Get Monitored Site by ID
Retrieves details for a specific site.

- **Method**: `GET`
- **Path**: `/sites/{id}`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sites/1
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 1,
    "name": "Mumbai Refinery Facility",
    "locationLabel": "Trombay Terminal, Maharashtra, India",
    "latitude": 19.0760,
    "longitude": 72.8777,
    "createdAt": "2026-09-27T08:00:00Z",
    "updatedAt": "2026-09-27T08:00:00Z"
  }
}
```

---

### 2.3 Create Monitored Site
Registers a new physical facility with latitude and longitude.

- **Method**: `POST`
- **Path**: `/sites`

#### Request Body Schema
| Field | Type | Required | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | Yes | Max 255 chars | Facility name |
| `locationLabel` | String | No | Max 500 chars | Descriptive physical address |
| `latitude` | Number | Yes | `-90.0` to `90.0` | GPS Latitude in decimal degrees |
| `longitude` | Number | Yes | `-180.0` to `180.0` | GPS Longitude in decimal degrees |

#### Example Request
```bash
curl -X POST http://localhost:8081/api/v1/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dover Maritime Terminal",
    "locationLabel": "Port of Dover, Kent, UK",
    "latitude": 51.1279,
    "longitude": 1.3134
  }'
```

#### Example Response (`201 Created`)
```json
{
  "success": true,
  "message": "Site created",
  "data": {
    "id": 3,
    "name": "Dover Maritime Terminal",
    "locationLabel": "Port of Dover, Kent, UK",
    "latitude": 51.1279,
    "longitude": 1.3134,
    "createdAt": "2026-09-28T10:14:00Z",
    "updatedAt": "2026-09-28T10:14:00Z"
  }
}
```

---

### 2.4 Update Monitored Site
Updates coordinates or metadata of an existing site.

- **Method**: `PUT`
- **Path**: `/sites/{id}`

#### Example Request
```bash
curl -X PUT http://localhost:8081/api/v1/sites/3 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dover Maritime Security Terminal",
    "locationLabel": "Western Docks, Dover, UK",
    "latitude": 51.1250,
    "longitude": 1.3110
  }'
```

---

### 2.5 Delete Monitored Site
Removes a facility and unlinks child sensor assets.

- **Method**: `DELETE`
- **Path**: `/sites/{id}`

#### Example Request
```bash
curl -X DELETE http://localhost:8081/api/v1/sites/3
```

#### Example Response (`204 No Content`)

---

## 3. Sensors & Fleet Registry API

### 3.1 List Sensors for a Site
Retrieves all sensors deployed at a specific facility along with their live configurations.

- **Method**: `GET`
- **Path**: `/sites/{siteId}/sensors`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sites/1/sensors
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 101,
      "siteId": 1,
      "sensorProfileId": 1,
      "profileCode": "GEO-PIDS-V2",
      "profileVersion": "2.1",
      "name": "North Fence Geophone Array",
      "manufacturer": "Senstar",
      "model": "FlexZone G-200",
      "installationZone": "Sector Alpha (North Boundary)",
      "status": "ACTIVE",
      "configuration": [
        {
          "parameterId": 1,
          "parameterKey": "sensitivity",
          "displayName": "Vibration Sensitivity",
          "unit": "scale_0_100",
          "currentValue": 75.0,
          "capturedAt": "2026-09-27T09:00:00Z"
        },
        {
          "parameterId": 2,
          "parameterKey": "cut_threshold",
          "displayName": "Cut Detection Threshold",
          "unit": "dB",
          "currentValue": 42.0,
          "capturedAt": "2026-09-27T09:00:00Z"
        }
      ],
      "createdAt": "2026-09-27T08:30:00Z",
      "updatedAt": "2026-09-27T09:00:00Z"
    }
  ]
}
```

---

### 3.2 Register Sensor at Site
Enrolls a new physical sensor device and initializes default configuration parameters.

- **Method**: `POST`
- **Path**: `/sites/{siteId}/sensors`

#### Request Body Schema
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sensorProfileId` | Long | Yes | ID of manufacturer sensor profile specification |
| `name` | String | Yes | Human-readable tag (e.g., "East Gate Radar") |
| `manufacturer` | String | No | Hardware OEM |
| `model` | String | No | Model number |
| `installationZone`| String | Yes | Physical sector description |
| `status` | String | Yes | `ACTIVE`, `MAINTENANCE`, `DISABLED` |
| `initialConfigurations` | Array | No | Key-value pairs for initial parameter states |

#### Example Request
```bash
curl -X POST http://localhost:8081/api/v1/sites/1/sensors \
  -H "Content-Type: application/json" \
  -d '{
    "sensorProfileId": 1,
    "name": "West Perimeter Geophone Section 4",
    "manufacturer": "Senstar",
    "model": "FlexZone G-200",
    "installationZone": "Sector Delta",
    "status": "ACTIVE",
    "initialConfigurations": [
      { "parameterKey": "sensitivity", "value": 70.0 }
    ]
  }'
```

---

### 3.3 Get Sensor Details & Current Configuration
- **Method**: `GET`
- **Path**: `/sensors/{id}`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sensors/101
```

---

### 3.4 Update Sensor & Operating Parameters
- **Method**: `PUT`
- **Path**: `/sensors/{id}`

#### Request Body Schema
```json
{
  "name": "North Fence Geophone Array - Recalibrated",
  "status": "ACTIVE",
  "installationZone": "Sector Alpha",
  "configurations": [
    {
      "parameterKey": "sensitivity",
      "value": 60.0
    }
  ]
}
```

---

### 3.5 Get Sensor Profile Definition for a Sensor
Retrieves the full parameter boundary definitions, units, and baseline values governing this sensor.

- **Method**: `GET`
- **Path**: `/sensors/{id}/profile`

---

## 4. Sensor Profiles & Parameter Boundaries API

### 4.1 List All Active Sensor Profiles
- **Method**: `GET`
- **Path**: `/sensor-profiles`

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "code": "GEO-PIDS-V2",
      "name": "Fence Geophone Vibration Sensor",
      "profileVersion": "2.1",
      "sensorType": "FENCE_VIBRATION",
      "description": "Acoustic and piezo vibration sensor mounted on chain-link perimeter fences.",
      "parameters": [
        {
          "id": 1,
          "parameterKey": "sensitivity",
          "displayName": "Sensitivity Threshold",
          "unit": "scale_0_100",
          "defaultValue": 70.0,
          "minValue": 10.0,
          "maxValue": 100.0,
          "sortOrder": 1
        }
      ]
    },
    {
      "id": 2,
      "code": "FIBER-OPTIC-PIDS",
      "name": "Buried / Fence Fiber-Optic Strain Sensor",
      "profileVersion": "1.4",
      "sensorType": "FIBER_OPTIC",
      "description": "Coherent OTDR fiber-optic cable measuring fence strain and ground acoustic waves.",
      "parameters": []
    }
  ]
}
```

---

## 5. Atmospheric Weather Telemetry API

### 5.1 Get Current Stored Weather for Site
Retrieves the latest persisted meteorological snapshot. If data is older than 30 minutes, `stale` is returned as `true`.

- **Method**: `GET`
- **Path**: `/sites/{siteId}/weather/current`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sites/1/weather/current
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "id": 501,
    "siteId": 1,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "temperatureC": 28.4,
    "humidityPercent": 82.0,
    "rainfallMm": 14.5,
    "windSpeedMs": 11.2,
    "windGustMs": 18.7,
    "weatherCode": 63,
    "stormCondition": true,
    "observedAt": "2026-09-28T10:00:00Z",
    "retrievedAt": "2026-09-28T10:05:00Z",
    "source": "OPEN_METEO",
    "partial": false,
    "missingVariables": [],
    "stale": false,
    "units": "temperature=C,humidity=percent,rainfall=mm,wind=m/s"
  }
}
```

---

### 5.2 Force Refresh Live Weather from Open-Meteo
Directly triggers an outbound HTTPS query to Open-Meteo using the site's geographic coordinates and records the observation in PostgreSQL.

- **Method**: `POST`
- **Path**: `/sites/{siteId}/weather/refresh`

#### Example Request
```bash
curl -X POST http://localhost:8081/api/v1/sites/1/weather/refresh
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "Weather refreshed",
  "data": {
    "id": 502,
    "siteId": 1,
    "latitude": 19.0760,
    "longitude": 72.8777,
    "temperatureC": 29.1,
    "humidityPercent": 84.0,
    "rainfallMm": 16.0,
    "windSpeedMs": 12.5,
    "windGustMs": 21.0,
    "weatherCode": 65,
    "stormCondition": true,
    "observedAt": "2026-09-28T10:30:00Z",
    "retrievedAt": "2026-09-28T10:30:05Z",
    "source": "OPEN_METEO",
    "partial": false,
    "missingVariables": [],
    "stale": false,
    "units": "temperature=C,humidity=percent,rainfall=mm,wind=m/s"
  }
}
```

---

### 5.3 Weather History for Site
Retrieves historical observations within a date-time range.

- **Method**: `GET`
- **Path**: `/sites/{siteId}/weather/history?from={ISO}&to={ISO}`

#### Query Parameters
- `from` (optional): ISO-8601 timestamp (e.g., `2026-09-27T00:00:00Z`)
- `to` (optional): ISO-8601 timestamp (e.g., `2026-09-28T23:59:59Z`)

---

## 6. Sensor Calibration & Recommendation API

### 6.1 Get Latest Calibration Recommendation
Retrieves the most recent calibration recommendation generated for a specific sensor.

- **Method**: `GET`
- **Path**: `/sensors/{sensorId}/calibration/current`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sensors/101/calibration/current
```

---

### 6.2 Evaluate Calibration Recommendation
Runs the **Deterministic Calibration Engine** against the latest weather conditions. Evaluates active rules, calculates mathematically clamped adjustments, queries the **AI contextual explanation layer**, and saves the proposal.

- **Method**: `POST`
- **Path**: `/sensors/{sensorId}/calibration/evaluate`

#### Example Request
```bash
curl -X POST http://localhost:8081/api/v1/sensors/101/calibration/evaluate
```

#### Example Response (`201 Created`)
```json
{
  "success": true,
  "message": "Recommendation generated",
  "data": {
    "id": 901,
    "sensorId": 101,
    "siteId": 1,
    "weatherRecordId": 502,
    "sensorProfileId": 1,
    "riskLevel": "HIGH",
    "affectedParameter": "sensitivity",
    "currentValue": 75.0,
    "recommendedValue": 55.0,
    "recommendedMin": 50.0,
    "recommendedMax": 60.0,
    "action": "DECREASE",
    "reasons": [
      "Wind speed 12.5 m/s exceeds threshold 8.0 m/s causing high fence resonance",
      "Heavy precipitation (16.0 mm) induces acoustic surface disturbance"
    ],
    "profileVersion": "2.1",
    "ruleVersion": "1.0",
    "status": "PENDING_REVIEW",
    "createdAt": "2026-09-28T10:30:10Z",
    "weather": {
      "temperatureC": 29.1,
      "humidityPercent": 84.0,
      "rainfallMm": 16.0,
      "windSpeedMs": 12.5,
      "windGustMs": 21.0,
      "stormCondition": true,
      "observedAt": "2026-09-28T10:30:00Z"
    },
    "aiAnalysis": {
      "summary": "Reduced sensitivity is recommended based on environmental factors.",
      "reason": "Current conditions include wind at 12.5 m/s and rainfall of 16.0 mm. These factors elevate the risk of environmental disturbances for a FENCE_VIBRATION sensor. The deterministic rule engine recommends a sensitivity range of 50.0 - 60.0 to mitigate this risk."
    }
  }
}
```

---

### 6.3 Historical Calibration Log for Sensor
- **Method**: `GET`
- **Path**: `/sensors/{sensorId}/calibration/history`

---

## 7. Analytics & Tactical Reporting API

### 7.1 Site Environmental & Calibration Analytics
Provides aggregated statistical intelligence, weather distributions, and recommendation volumes.

- **Method**: `GET`
- **Path**: `/sites/{siteId}/analytics`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sites/1/analytics
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "siteId": 1,
    "weather": {
      "totalObservations": 142,
      "avgTemperatureC": 27.8,
      "avgHumidityPercent": 79.5,
      "maxWindSpeedMs": 24.1,
      "totalRainfallMm": 184.2,
      "stormCount": 18
    },
    "calibration": {
      "totalRecommendations": 56,
      "recommendationsByRiskLevel": {
        "LOW": 14,
        "MEDIUM": 22,
        "HIGH": 18,
        "CRITICAL": 2
      },
      "actionsCount": {
        "INCREASE": 12,
        "DECREASE": 36,
        "MAINTAIN": 8
      },
      "recommendationsBySensor": {
        "North Fence Geophone Array": 28,
        "East Boundary Microwave": 16,
        "South Gate Fiber Optic": 12
      }
    }
  }
}
```

---

### 7.2 Site Operational Report
Generates an operational summary including recent weather observations and calibration audits suitable for executive review and export.

- **Method**: `GET`
- **Path**: `/sites/{siteId}/reports`

#### Example Request
```bash
curl -X GET http://localhost:8081/api/v1/sites/1/reports
```

#### Example Response (`200 OK`)
```json
{
  "success": true,
  "message": "OK",
  "data": {
    "siteId": 1,
    "siteName": "Mumbai Refinery Facility",
    "generatedAt": "2026-09-28T10:35:00Z",
    "timeRange": "LAST_30_DAYS",
    "analyticsSummary": {
      "siteId": 1,
      "weather": {
        "totalObservations": 142,
        "avgTemperatureC": 27.8,
        "avgHumidityPercent": 79.5,
        "maxWindSpeedMs": 24.1,
        "totalRainfallMm": 184.2,
        "stormCount": 18
      },
      "calibration": {
        "totalRecommendations": 56,
        "recommendationsByRiskLevel": {
          "LOW": 14,
          "MEDIUM": 22,
          "HIGH": 18,
          "CRITICAL": 2
        },
        "actionsCount": {
          "INCREASE": 12,
          "DECREASE": 36,
          "MAINTAIN": 8
        },
        "recommendationsBySensor": {
          "North Fence Geophone Array": 28,
          "East Boundary Microwave": 16,
          "South Gate Fiber Optic": 12
        }
      }
    },
    "recentWeather": [
      {
        "observedAt": "2026-09-28T10:30:00Z",
        "summary": "Temp 29.1°C, Wind 12.5 m/s, Rain 16.0 mm, Storm: YES"
      }
    ],
    "recentRecommendations": [
      {
        "createdAt": "2026-09-28T10:30:10Z",
        "sensorName": "North Fence Geophone Array",
        "action": "DECREASE",
        "parameter": "sensitivity",
        "reason": "Wind speed 12.5 m/s exceeds threshold 8.0 m/s causing high fence resonance"
      }
    ]
  }
}
```
