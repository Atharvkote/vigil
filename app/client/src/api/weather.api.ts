import { api } from './client';
import type { WeatherRecord } from '../types';

export const weatherApi = {
  current: (siteId: number) => 
    api.get<WeatherRecord>(`/api/v1/sites/${siteId}/weather/current`),
  refresh: (siteId: number) => 
    api.post<WeatherRecord>(`/api/v1/sites/${siteId}/weather/refresh`),
  history: (siteId: number, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<WeatherRecord[]>(`/api/v1/sites/${siteId}/weather/history${query}`);
  },
};
