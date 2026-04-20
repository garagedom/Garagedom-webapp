import { apiClient } from '@/lib/api-client';
import { setToken, clearToken } from '@/lib/auth-token';
import { useAuthStore } from '@/stores/authStore';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  terms_accepted: boolean;
}

interface AuthResponse {
  token: string;
  user: { id: number; email: string; profile_id?: number; profile_type?: string };
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

export async function fetchCurrentUser(): Promise<void> {
  const { data } = await apiClient.get<{
    id: number;
    email: string;
    profile_id?: number;
    profile_type?: string;
  }>('/api/v1/users/me');
  const store = useAuthStore.getState();
  store.setUser({ id: data.id, email: data.email });
  if (data.profile_id && data.profile_type) {
    store.setProfile(data.profile_id, data.profile_type as import('@/lib/schemas/profileSchema').ProfileType);
  }
}

export function logout(): void {
  clearToken();
  useAuthStore.getState().clearAuth();
  // TODO: desconectar ActionCable quando implementado (Story 7.x)
}
