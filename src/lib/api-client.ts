import axios from 'axios';
import { getToken, setToken, clearToken } from './auth-token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // needed for httpOnly cookie refresh flow
});

// Request interceptor: inject JWT
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Tracks whether a refresh is already in flight to prevent concurrent refreshes
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

function notifyRefreshSubscribers(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshToken(): Promise<string> {
  const { data } = await axios.post<{ token: string }>(
    `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
    {},
    { withCredentials: true },
  );
  return data.token;
}

// Response interceptor: 401 → silent refresh + retry (max 1 retry)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config as typeof error.config & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue request until refresh completes
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!originalRequest) return reject(error);
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          originalRequest._retry = true;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshToken();
      setToken(newToken);
      notifyRefreshSubscribers(newToken);

      if (originalRequest) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      }
    } catch {
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }

    return Promise.reject(error);
  },
);
