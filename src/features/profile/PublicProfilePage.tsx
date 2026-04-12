import { Link, useParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AsyncState } from '@/components/AsyncState';
import { Navigation } from '@/components/Navigation/Navigation';
import { usePublicProfile } from './hooks/useProfile';
import { ProfileHeader } from './components/ProfileHeader';
import { ShowsHistory } from './components/ShowsHistory';

export default function PublicProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: profile, isLoading, isError } = usePublicProfile(id);
  const currentUser = useAuthStore((s) => s.user);

  const isOwnProfile = currentUser?.profileId === Number(id);
  const canConnect =
    !isOwnProfile &&
    currentUser?.profileType === 'band' &&
    profile?.profile_type === 'band';

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
        <Navigation />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
          <p className="text-sm" style={{ color: '#9ca3af' }}>Perfil não encontrado.</p>
          <Link to="/app/map" className="text-sm underline" style={{ color: '#F2CF1D' }}>
            Explorar no mapa
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      <Navigation />

      <main className="flex-1 px-6 py-8 max-w-sm mx-auto w-full">
        <Link to="/app/map" className="text-sm underline mb-6 block" style={{ color: '#9ca3af' }}>
          ← Voltar ao mapa
        </Link>

        <AsyncState isLoading={isLoading} isError={false}>
          {profile && (
            <div className="flex flex-col gap-8">
              <ProfileHeader profile={profile} />

              {canConnect && (
                <button
                  type="button"
                  className="w-full px-6 py-3 text-base font-semibold"
                  style={{
                    backgroundColor: '#F2CF1D',
                    color: '#0D0D0D',
                    border: '2px solid #0D0D0D',
                    boxShadow: '4px 4px 0 #F2CF1D',
                  }}
                  // TODO: Story 5.1 — Enviar Convite de Conexão
                  disabled
                >
                  Enviar Conexão
                </button>
              )}

              <section>
                <h2 className="text-sm font-semibold uppercase mb-4" style={{ color: '#6b7280' }}>
                  Histórico de Shows
                </h2>
                <ShowsHistory shows={profile.shows_history} />
              </section>
            </div>
          )}
        </AsyncState>
      </main>
    </div>
  );
}
