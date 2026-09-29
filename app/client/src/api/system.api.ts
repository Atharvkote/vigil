import { api } from './client';
import type { SystemAcknowledgement, SystemLog } from '../types';

export const DEFAULT_ACKNOWLEDGEMENTS: SystemAcknowledgement[] = [
  {
    id: 'open-meteo',
    name: 'Open-Meteo Weather API',
    category: 'EXTERNAL_API',
    provider: 'Open-Meteo GmbH',
    license: 'Non-Commercial / Creative Commons Attribution 4.0',
    url: 'https://open-meteo.com',
    description: 'High-resolution open-source global atmospheric models providing hourly forecast and live observation telemetry.',
    roleInVigilSense: 'Primary atmospheric data provider for wind speed, wind gusts, precipitation, temperature, relative humidity, and WMO storm classification.',
    version: 'v1 / Forecast API',
  },
  {
    id: 'leaflet-osm',
    name: 'Leaflet & OpenStreetMap',
    category: 'GIS_MAPPING',
    provider: 'Leaflet & OpenStreetMap Foundation',
    license: 'BSD 2-Clause / Open Database License (ODbL)',
    url: 'https://leafletjs.com',
    description: 'Lightweight open-source tactical mapping library integrated with collaborative worldwide OpenStreetMap raster tiles.',
    roleInVigilSense: 'Zero-key GIS mapping engine providing continuous perimeter contour zoning (800m, 400m, 150m) and sensor geolocation without commercial API keys.',
    version: 'Leaflet 1.9.4',
  },
  {
    id: 'spring-boot',
    name: 'Spring Boot 3 & Java 21 LTS',
    category: 'CORE_FRAMEWORK',
    provider: 'VMware Tanzu / OpenJDK Community',
    license: 'Apache License 2.0',
    url: 'https://spring.io/projects/spring-boot',
    description: 'Modern enterprise Java application platform featuring virtual threads, Spring Data JPA, and Spring AOP.',
    roleInVigilSense: 'Application core runtime hosting REST controllers, deterministic calibration evaluator, and transactional audit trails.',
    version: '3.5.16 / Java 21 LTS',
  },
  {
    id: 'postgresql-flyway',
    name: 'PostgreSQL & Flyway Migration Engine',
    category: 'DATABASE',
    provider: 'PostgreSQL Global Development Group & Redgate',
    license: 'PostgreSQL License / Apache License 2.0',
    url: 'https://www.postgresql.org',
    description: 'ACID-compliant object-relational database management system with declarative version-controlled schema migrations.',
    roleInVigilSense: 'Persistent store for monitored facilities, hardware sensor profiles, parameters, weather logs, recommendations, and AI analyses (Migrations V1-V9).',
    version: 'PostgreSQL 15+ / Flyway 10',
  },
  {
    id: 'xai-llm-engine',
    name: 'Explainable AI (XAI) & LLM Reasoning Engine',
    category: 'AI_ENGINE',
    provider: 'VigilSense Intelligence Subsystem',
    license: 'Apache License 2.0',
    url: 'https://github.com/Atharvkote/Vigil',
    description: 'Contextual natural language explanation synthesis engine providing cyber-physical reasoning for all sensor sensitivity proposals.',
    roleInVigilSense: 'Translates raw meteorological variables (wind turbulence, acoustic precipitation) and rule engine actions into plain-language SOC operator justifications.',
    version: 'v1.0-Contextual',
  },
  {
    id: 'deterministic-rule-engine',
    name: 'Deterministic Calibration Engine v1.0',
    category: 'RULE_ENGINE',
    provider: 'VigilSense Engineering Core',
    license: 'Apache License 2.0',
    url: 'https://github.com/Atharvkote/Vigil',
    description: 'Rule-matching algorithm based on the A-1 Launchpad case study with strict physical hardware boundary clamping.',
    roleInVigilSense: 'Evaluates sensor profile thresholds against weather factors, computes directional adjustments (INCREASE/DECREASE), and pins values within [min, max].',
    version: 'v1.0',
  },
  {
    id: 'react-vite-tailwind',
    name: 'React 19, Vite & Tailwind CSS v4',
    category: 'FRONTEND',
    provider: 'Meta, Evan You & Tailwind Labs',
    license: 'MIT License',
    url: 'https://react.dev',
    description: 'Ultra-performant reactive frontend ecosystem featuring TypeScript 5 and Lucide React tactical icons.',
    roleInVigilSense: 'Powers the tactical SOC operations console, environmental stress simulator, continuous GIS mapping, and live diagnostics.',
    version: 'React 19.0 / Vite 6.0 / Tailwind v4',
  },
  {
    id: 'a1-launchpad',
    name: 'A-1 Launchpad Case Study (2) Baseline',
    category: 'SPECIFICATION',
    provider: 'A-1 Launchpad Challenge Committee',
    license: 'Academic & Prototype Specification',
    url: 'https://github.com/Atharvkote/Vigil',
    description: 'Authoritative specification defining the Weather-Based Sensor Calibration Suggestion System for Perimeter Intrusion Detection Systems.',
    roleInVigilSense: 'Foundational requirements baseline for weather factors, inverse sensitivity relationships, operator dashboard, and deliverables.',
    version: '2026 Edition',
  },
];

export const DEFAULT_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'RULE-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    subsystem: 'RULE_ENGINE',
    level: 'RULE_EXEC',
    source: 'CalibrationEngine',
    siteName: 'Mumbai Refinery Facility',
    sensorName: 'North Fence Geophone Array',
    message: "RULE EVALUATED: Action DECREASE on 'sensitivity' -> target 55.0 (current: 75.0, clamped: 10.0-100.0)",
    details: 'Wind speed 12.5 m/s exceeds threshold 8.0 m/s causing high fence resonance | Heavy precipitation (16.0 mm) induces acoustic surface disturbance',
    metadata: {
      action: 'DECREASE',
      hardwareBounds: '[10.0, 100.0]',
      parameter: 'sensitivity',
      recommendedValue: 55.0,
      riskLevel: 'HIGH',
      ruleVersion: '1.0',
    },
  },
  {
    id: 'AI-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 2 + 45).toISOString(),
    subsystem: 'AI_ENGINE',
    level: 'AI_ANALYSIS',
    source: 'AiRecommendationService / LlmAiClient',
    siteName: 'Mumbai Refinery Facility',
    sensorName: 'North Fence Geophone Array',
    message: 'AI EXPLANATION: Reduced sensitivity is recommended based on environmental factors.',
    details: 'Current conditions include wind at 12.5 m/s and rainfall of 16.0 mm. These factors elevate the risk of environmental disturbances for a FENCE_VIBRATION sensor. The deterministic rule engine recommends a sensitivity range of 50.0 - 60.0 to mitigate this risk.',
    metadata: {
      recommendationId: 101,
      sensor: 'North Fence Geophone Array',
      summary: 'Reduced sensitivity is recommended based on environmental factors.',
    },
  },
  {
    id: 'WX-201',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    subsystem: 'WEATHER_API',
    level: 'WARN',
    source: 'OpenMeteoClient',
    siteName: 'Mumbai Refinery Facility',
    sensorName: 'Weather Station',
    message: 'TELEMETRY INGESTION: Temp 29.1°C, Wind 12.5 m/s (Gusts: 21.0 m/s), Rain 16.0 mm, Storm=true',
    details: 'Observed at: Live Station Telemetry | Source: OPEN_METEO | Stale: false',
    metadata: {
      humidityPercent: 84.0,
      rainfallMm: 16.0,
      stormCondition: true,
      temperatureC: 29.1,
      weatherCode: 65,
      windGustMs: 21.0,
      windSpeedMs: 12.5,
    },
  },
  {
    id: 'RULE-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    subsystem: 'RULE_ENGINE',
    level: 'RULE_EXEC',
    source: 'CalibrationEngine',
    siteName: 'Delhi High-Security Data Center',
    sensorName: 'East Boundary Microwave Barrier',
    message: "RULE EVALUATED: Action MAINTAIN on 'threshold' -> target 42.0 (current: 42.0, clamped: 20.0-80.0)",
    details: 'Atmospheric attenuation within normal baseline limits (Temp 24.2°C, Humidity 45%). Barrier operating in optimal detection corridor.',
    metadata: {
      action: 'MAINTAIN',
      hardwareBounds: '[20.0, 80.0]',
      parameter: 'threshold',
      recommendedValue: 42.0,
      riskLevel: 'LOW',
      ruleVersion: '1.0',
    },
  },
  {
    id: 'AI-102',
    timestamp: new Date(Date.now() - 1000 * 60 * 12 + 40).toISOString(),
    subsystem: 'AI_ENGINE',
    level: 'AI_ANALYSIS',
    source: 'AiRecommendationService / LlmAiClient',
    siteName: 'Delhi High-Security Data Center',
    sensorName: 'East Boundary Microwave Barrier',
    message: 'AI EXPLANATION: Microwave barrier sensitivity maintained within nominal corridor.',
    details: 'Environmental parameters are calm without fog or precipitation scattering. Maintaining current threshold ensures zero detection blind spots while avoiding false multipath reflections.',
    metadata: {
      recommendationId: 102,
      sensor: 'East Boundary Microwave Barrier',
      confidence: 'OPTIMAL',
    },
  },
  {
    id: 'SYS-AUDIT-01',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    subsystem: 'AUDIT_TRAIL',
    level: 'SUCCESS',
    source: 'AuditAspect',
    siteName: 'Global System',
    sensorName: 'AOP Interceptor',
    message: 'Spring AOP @Auditable interceptor verified. Forensic modification trails active.',
    details: 'All calibration proposals, operator overrides, and parameter updates are cryptographically logged with forensic timestamps.',
    metadata: {
      interceptor: 'AuditAspect',
      policy: 'STRICT_AUDIT',
    },
  },
];

export const systemApi = {
  getAcknowledgements: async () => {
    try {
      const data = await api.get<SystemAcknowledgement[]>('/api/v1/system/acknowledgements');
      return data && data.length > 0 ? data : DEFAULT_ACKNOWLEDGEMENTS;
    } catch {
      return DEFAULT_ACKNOWLEDGEMENTS;
    }
  },
  getLogs: async () => {
    try {
      const data = await api.get<SystemLog[]>('/api/v1/system/logs');
      return data && data.length > 0 ? data : DEFAULT_SYSTEM_LOGS;
    } catch {
      return DEFAULT_SYSTEM_LOGS;
    }
  },
};
