import { lazy } from 'react';

export const LandingPage        = lazy(() => import('@/features/landing/LandingPage'));
export const LoginPage          = lazy(() => import('@/features/auth/LoginPage'));
export const RegisterPage       = lazy(() => import('@/features/auth/RegisterPage'));
export const OAuthCallback        = lazy(() => import('@/features/auth/OAuthCallback'));
export const ForgotPasswordPage   = lazy(() => import('@/features/auth/ForgotPasswordPage'));
export const ResetPasswordPage    = lazy(() => import('@/features/auth/ResetPasswordPage'));
export const MapPage              = lazy(() => import('@/features/app/map/MapPage'));
export const CreateProfilePage    = lazy(() => import('@/features/profile/CreateProfilePage'));
export const EditProfilePage      = lazy(() => import('@/features/profile/EditProfilePage'));
export const PublicProfilePage    = lazy(() => import('@/features/profile/PublicProfilePage'));
export const ComingSoonPage       = lazy(() => import('@/components/ComingSoonPage'));
