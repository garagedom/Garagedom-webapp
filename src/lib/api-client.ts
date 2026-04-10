import axios from 'axios';
import { getToken, clearToken } from './auth-token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // needed for future httpOnly cookie refresh flow
});

// Request interceptor: inject JWT
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: 401 → dispatch event (avoids circular import with authStore)
// NOTE: No refresh retry — backend endpoint does not exist yet (garagedom-api as of 2026-04-10)
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);
