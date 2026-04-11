import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  MapPage,
  CreateProfilePage,
} from './lazyRoutes';

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
        <ProtectedRoute>
          <MapPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '/app/profile/create',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute>
          <CreateProfilePage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
