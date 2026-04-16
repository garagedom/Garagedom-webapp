import { Link } from 'react-router-dom';

interface HiddenPinBannerProps {
  profileId: number;
}

export function HiddenPinBanner({ profileId }: HiddenPinBannerProps) {
  return (
    <div
      className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 px-4 py-2 text-xs"
      style={{
        backgroundColor: '#1a1a1a',
        border: '2px solid #374151',
        borderRadius: '4px',
        color: '#9ca3af',
        whiteSpace: 'nowrap',
      }}
    >
      <span>Seu pin está oculto para outros usuários.</span>
      <Link
        to={`/app/profile/${profileId}/edit`}
        style={{ color: '#F2CF1D', textDecoration: 'none', fontWeight: 600 }}
      >
        Ativar visibilidade
      </Link>
    </div>
  );
}
