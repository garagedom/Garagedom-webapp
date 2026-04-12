import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import type { ProfileType } from '@/lib/schemas/profileSchema';

interface ProfileRouteProps {
  children: React.ReactNode;
  allowedTypes: ProfileType[];
}

export function ProfileRoute({ children, allowedTypes }: ProfileRouteProps) {
  const user = useAuthStore((s) => s.user);

  if (!user?.profileType || !allowedTypes.includes(user.profileType)) {
    return <Navigate to="/app/map" replace />;
  }

  return <>{children}</>;
}
