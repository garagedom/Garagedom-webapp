import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/lib/query-client';
import { router } from '@/router';
import { useAuthStore } from '@/stores/authStore';
import { clearToken } from '@/lib/auth-token';
import { useSessionInit } from '@/features/auth/useSessionInit';

function AppCore() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  // Handle session expiry during active use
  useEffect(() => {
    const handler = () => {
      clearToken();
      clearAuth();
      void router.navigate('/login');
    };
    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [clearAuth]);

  return <RouterProvider router={router} />;
}

function SessionGate({ children }: { children: React.ReactNode }) {
  const { ready } = useSessionInit();

  if (!ready) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0D0D0D' }}
      />
    );
  }

  return <>{children}</>;
}

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionGate>
        <AppCore />
      </SessionGate>
    </QueryClientProvider>
  );
}
