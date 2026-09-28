import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Accept', 'application/json');

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return null as T;
    }

    const json: ApiResponse<T> = await response.json();

    if (!response.ok || !json.success) {
      throw new ApiError(
        json.message || `Request failed with status ${response.status}`,
        response.status,
        json
      );
    }

    return json.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed',
      0
    );
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown) => 
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) => 
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
