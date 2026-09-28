import { api } from './client';
import type { SiteAnalytics, SiteReport } from '../types';

export const analyticsApi = {
  getAnalytics: (siteId: number, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<SiteAnalytics>(`/api/v1/sites/${siteId}/analytics${query}`);
  },
  getReport: (siteId: number) => 
    api.get<SiteReport>(`/api/v1/sites/${siteId}/reports`),
};
