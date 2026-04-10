import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const LandingPage  = lazy(() => import('@/features/landing/LandingPage'));
const LoginPage    = lazy(() => import('@/features/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/RegisterPage'));
const MapPage      = lazy(() => import('@/features/app/map/MapPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={null}>
        <LandingPage />
      </Suspense>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={null}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={null}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/app/map',
    element: (
      <Suspense fallback={null}>
        <MapPage />
      </Suspense>
    ),
  },
]);
