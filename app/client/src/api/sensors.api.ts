import { api } from './client';
import type { Sensor, CreateSensorRequest, UpdateSensorRequest, SensorProfile } from '../types';

export const sensorsApi = {
  listBySite: (siteId: number) => api.get<Sensor[]>(`/api/v1/sites/${siteId}/sensors`),
  get: (sensorId: number) => api.get<Sensor>(`/api/v1/sensors/${sensorId}`),
  create: (siteId: number, data: CreateSensorRequest) => 
    api.post<Sensor>(`/api/v1/sites/${siteId}/sensors`, data),
  update: (sensorId: number, data: UpdateSensorRequest) => 
    api.put<Sensor>(`/api/v1/sensors/${sensorId}`, data),
  getProfile: (sensorId: number) => 
    api.get<SensorProfile>(`/api/v1/sensors/${sensorId}/profile`),
};
