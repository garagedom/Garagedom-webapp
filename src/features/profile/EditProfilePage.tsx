import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AsyncState } from '@/components/AsyncState';
import { Navigation } from '@/components/Navigation/Navigation';
import { useProfile } from './hooks/useProfile';
import { EditProfileForm } from './components/EditProfileForm';

export default function EditProfilePage() {
  const profileId = useAuthStore((s) => s.user?.profileId);
  const { data: profile, isLoading, isError } = useProfile(profileId ?? 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      <Navigation />

      <main className="flex-1 px-6 py-8 max-w-sm mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/app/map"
            className="text-sm underline"
            style={{ color: '#9ca3af' }}
          >
            ← Mapa
          </Link>
          <h1 className="text-xl font-bold" style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}>
            Editar Perfil
          </h1>
        </div>

        <AsyncState
          isLoading={isLoading}
          isError={isError}
          errorMessage="Erro ao carregar o perfil."
        >
          {profile && <EditProfileForm profile={profile} />}
        </AsyncState>
      </main>
    </div>
  );
}
