import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useAuthStore } from '@/stores/authStore';
import type { MapPin } from '@/lib/schemas/mapSchema';

const PROFILE_TYPE_LABEL: Record<string, string> = {
  band: 'Banda',
  venue: 'Venue',
  producer: 'Produtor',
};

interface ProfilePopupProps {
  pin: MapPin;
  onClose: () => void;
}

export function ProfilePopup({ pin, onClose }: ProfilePopupProps) {
  const user = useAuthStore((s) => s.user);
  const isOwnProfile = user?.profileId === pin.id;
  const canConnect =
    !isOwnProfile && user?.profileType === 'band' && pin.profile_type === 'band';

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-label={`Perfil de ${pin.name}`}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-80 p-4 flex flex-col gap-3"
      style={{ backgroundColor: '#1a1a1a', border: '2px solid #F2CF1D', borderRadius: '4px' }}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-sm leading-none"
        style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
        aria-label="Fechar popup"
      >
        ✕
      </button>

      <div className="flex items-center gap-3">
        <ProfileAvatar name={pin.name} logoUrl={pin.logo_url} size="md" />
        <div className="flex flex-col gap-0.5">
          <p className="font-bold text-sm leading-tight" style={{ color: '#F2CF1D' }}>
            {pin.name}
          </p>
          <p className="text-xs capitalize" style={{ color: '#9ca3af' }}>
            {PROFILE_TYPE_LABEL[pin.profile_type]} · {pin.city ?? '—'}
          </p>
          {pin.music_genre && (
            <p className="text-xs" style={{ color: '#6b7280' }}>
              {pin.music_genre}
            </p>
          )}
        </div>
      </div>

      {isOwnProfile && (
        <p
          className="text-xs font-medium text-center py-1"
          style={{ color: '#F2CF1D', border: '1px solid #F2CF1D', borderRadius: '2px' }}
        >
          Este é você
        </p>
      )}

      <div className="flex gap-2">
        <Link
          to={`/app/profile/${pin.id}`}
          className="flex-1 px-3 py-1.5 text-xs text-center font-medium"
          style={{
            color: '#F2CF1D',
            border: '2px solid #F2CF1D',
            backgroundColor: 'transparent',
            borderRadius: '4px',
            textDecoration: 'none',
          }}
        >
          Ver Perfil Completo
        </Link>
        {canConnect && (
          <button
            disabled
            className="flex-1 px-3 py-1.5 text-xs font-medium"
            style={{
              color: '#0D0D0D',
              backgroundColor: '#F2CF1D',
              border: '2px solid #F2CF1D',
              borderRadius: '4px',
              opacity: 0.6,
              cursor: 'not-allowed',
            }}
            title="Disponível em breve"
          >
            Enviar Conexão
            {/* TODO: Story 5.1 */}
          </button>
        )}
      </div>
    </div>
  );
}
