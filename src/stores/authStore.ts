import { create } from 'zustand';
import type { ProfileType } from '@/lib/schemas/profileSchema';

interface AuthUser {
  id: number;
  email: string;
  profileId?: number;
  profileType?: ProfileType;
}

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setUser: (user: AuthUser) => void;
  setProfile: (profileId: number, profileType: ProfileType) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ isAuthenticated: true, user }),
  setProfile: (profileId, profileType) =>
    set((state) => ({
      user: state.user ? { ...state.user, profileId, profileType } : state.user,
    })),
  clearAuth: () => set({ isAuthenticated: false, user: null }),
}));
