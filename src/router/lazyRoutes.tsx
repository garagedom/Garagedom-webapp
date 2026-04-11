import { lazy } from 'react';

export const LandingPage        = lazy(() => import('@/features/landing/LandingPage'));
export const LoginPage          = lazy(() => import('@/features/auth/LoginPage'));
export const RegisterPage       = lazy(() => import('@/features/auth/RegisterPage'));
export const MapPage            = lazy(() => import('@/features/app/map/MapPage'));
export const CreateProfilePage  = lazy(() => import('@/features/profile/CreateProfilePage'));
