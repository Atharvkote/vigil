import { api } from './client';
import type { Site, CreateSiteRequest, UpdateSiteRequest } from '../types';

export const sitesApi = {
  list: () => api.get<Site[]>('/api/v1/sites'),
  get: (id: number) => api.get<Site>(`/api/v1/sites/${id}`),
  create: (data: CreateSiteRequest) => api.post<Site>('/api/v1/sites', data),
  update: (id: number, data: UpdateSiteRequest) => api.put<Site>(`/api/v1/sites/${id}`, data),
  delete: (id: number) => api.delete<void>(`/api/v1/sites/${id}`),
};
