import { api } from './client';
import type { SensorProfile } from '../types';

export const profilesApi = {
  list: () => api.get<SensorProfile[]>('/api/v1/sensor-profiles'),
  get: (id: number) => api.get<SensorProfile>(`/api/v1/sensor-profiles/${id}`),
};
