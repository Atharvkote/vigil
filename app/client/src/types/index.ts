export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Site {
  id: number;
  name: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSiteRequest {
  name: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
}

export interface UpdateSiteRequest {
  name: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
}

export interface SensorParameter {
  id: number;
  parameterKey: string;
  displayName: string;
  unit: string;
  dataType: 'DECIMAL' | 'INTEGER' | 'BOOLEAN' | 'STRING';
  minValue: number | null;
  maxValue: number | null;
  defaultValue: number | null;
  sortOrder: number;
}

export interface SensorProfile {
  id: number;
  code: string;
  name: string;
  description: string;
  manufacturerScope: string;
  modelScope: string;
  profileVersion: string;
  relevantWeatherFactors: string[];
  active: boolean;
  parameters: SensorParameter[];
}

export type SensorStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

export interface SensorConfiguration {
  parameterId: number;
  parameterKey: string;
  displayName: string;
  unit: string;
  currentValue: number;
  capturedAt: string;
}

export interface Sensor {
  id: number;
  siteId: number;
  sensorProfileId: number;
  profileCode: string;
  profileVersion: string;
  name: string;
  manufacturer: string;
  model: string;
  installationZone: string;
  status: SensorStatus;
  configuration: SensorConfiguration[];
  createdAt: string;
  updatedAt: string;
}

export interface ParameterValueRequest {
  parameterKey: string;
  value: number;
}

export interface CreateSensorRequest {
  name: string;
  sensorProfileId: number;
  manufacturer: string;
  model: string;
  installationZone: string;
  status: SensorStatus;
  configuration: ParameterValueRequest[];
}

export interface UpdateSensorRequest {
  name: string;
  manufacturer: string;
  model: string;
  installationZone: string;
  status: SensorStatus;
  configuration: ParameterValueRequest[];
}

export interface WeatherRecord {
  id: number;
  siteId: number;
  latitude: number;
  longitude: number;
  temperatureC: number;
  humidityPercent: number;
  rainfallMm: number;
  windSpeedMs: number;
  windGustMs: number;
  weatherCode: number;
  stormCondition: boolean;
  observedAt: string;
  retrievedAt: string;
  source: string;
  partial: boolean;
  missingVariables: string[];
  stale: boolean;
  units: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type CalibrationAction = 'INCREASE' | 'DECREASE' | 'MAINTAIN' | 'SET';
export type RecommendationStatus = 'GENERATED' | 'ACKNOWLEDGED' | 'APPLIED';

export interface WeatherSnapshot {
  temperatureC: number;
  humidityPercent: number;
  rainfallMm: number;
  windSpeedMs: number;
  windGustMs: number;
  stormCondition: boolean;
  observedAt: string;
}

export interface AiAnalysis {
  summary: string;
  reason: string;
}

export interface CalibrationRecommendation {
  id: number;
  sensorId: number;
  siteId: number;
  weatherRecordId: number;
  sensorProfileId: number;
  riskLevel: RiskLevel;
  affectedParameter: string;
  currentValue: number;
  recommendedValue: number;
  recommendedMin: number;
  recommendedMax: number;
  action: CalibrationAction;
  reasons: string[];
  profileVersion: string;
  ruleVersion: string;
  status: RecommendationStatus;
  createdAt: string;
  weather: WeatherSnapshot;
  aiAnalysis?: AiAnalysis | null;
}

export interface SiteAnalytics {
  siteId: number;
  weather: {
    totalObservations: number;
    avgTemperatureC: number;
    avgHumidityPercent: number;
    maxWindSpeedMs: number;
    totalRainfallMm: number;
    stormCount: number;
  };
  calibration: {
    totalRecommendations: number;
    recommendationsByRiskLevel: Record<string, number>;
    actionsCount: Record<string, number>;
    recommendationsBySensor: Record<string, number>;
  };
}

export interface SiteReport {
  siteId: number;
  siteName: string;
  generatedAt: string;
  timeRange: string;
  analyticsSummary: SiteAnalytics;
  recentWeather: Array<{
    observedAt: string;
    summary: string;
  }>;
  recentRecommendations: Array<{
    createdAt: string;
    sensorName: string;
    action: string;
    parameter: string;
    reason: string;
  }>;
}

export interface SystemAcknowledgement {
  id: string;
  name: string;
  category: string;
  provider: string;
  license: string;
  url: string;
  description: string;
  roleInVigilSense: string;
  version: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  subsystem: 'RULE_ENGINE' | 'AI_ENGINE' | 'WEATHER_API' | 'AUDIT_TRAIL';
  level: 'INFO' | 'WARN' | 'SUCCESS' | 'RULE_EXEC' | 'AI_ANALYSIS';
  source: string;
  siteName: string;
  sensorName: string;
  message: string;
  details: string;
  metadata?: Record<string, any>;
}
