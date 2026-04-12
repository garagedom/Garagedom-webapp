import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { ProtectedRoute } from './ProtectedRoute';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  OAuthCallback,
  ForgotPasswordPage,
  ResetPasswordPage,
  MapPage,
  CreateProfilePage,
  EditProfilePage,
  PublicProfilePage,
  ComingSoonPage,
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
    path: '/forgot-password',
    element: (
      <Suspense fallback={null}>
        <ForgotPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/reset-password',
    element: (
      <Suspense fallback={null}>
        <ResetPasswordPage />
      </Suspense>
    ),
  },
  {
    path: '/app/auth/callback',
    element: (
      <Suspense fallback={null}>
        <OAuthCallback />
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
    path: '/app/profile/edit',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute>
          <EditProfilePage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '/app/profile/:id',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute>
          <PublicProfilePage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '/app/connections',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute>
          <ComingSoonPage title="Conexões" />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '/app/proposals',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute>
          <ComingSoonPage title="Propostas" />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '/app/chat',
    element: (
      <Suspense fallback={null}>
        <ProtectedRoute>
          <ComingSoonPage title="Chat" />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
