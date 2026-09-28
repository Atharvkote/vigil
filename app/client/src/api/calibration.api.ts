import { api } from './client';
import type { CalibrationRecommendation } from '../types';

export const calibrationApi = {
  current: (sensorId: number) => 
    api.get<CalibrationRecommendation>(`/api/v1/sensors/${sensorId}/calibration/current`),
  evaluate: (sensorId: number) => 
    api.post<CalibrationRecommendation>(`/api/v1/sensors/${sensorId}/calibration/evaluate`),
  history: (sensorId: number) => 
    api.get<CalibrationRecommendation[]>(`/api/v1/sensors/${sensorId}/calibration/history`),
};
