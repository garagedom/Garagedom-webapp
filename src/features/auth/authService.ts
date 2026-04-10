import { apiClient } from '@/lib/api-client';
import { setToken } from '@/lib/auth-token';
import { useAuthStore } from '@/stores/authStore';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
}

interface AuthResponse {
  token: string;
  user: { id: number; email: string };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', { user: payload });
  setToken(data.token);
  useAuthStore.getState().setUser(data.user);
  return data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', { user: payload });
  setToken(data.token);
  useAuthStore.getState().setUser(data.user);
  return data;
}
