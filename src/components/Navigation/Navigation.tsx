import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { logout } from '@/features/auth/authService';

// Placeholder até Story 7.3 implementar contagem de não-lidos
const useUnreadCount = () => 0;

const NAV_ITEMS = {
  band: [
    { label: 'Mapa', to: '/app/map' },
    { label: 'Conexões', to: '/app/connections' },
    { label: 'Propostas', to: '/app/proposals' },
    { label: 'Chat', to: '/app/chat', badge: true },
    { label: 'Meu Perfil', to: '/app/profile/edit' },
  ],
  venue: [
    { label: 'Mapa', to: '/app/map' },
    { label: 'Propostas', to: '/app/proposals' },
    { label: 'Chat', to: '/app/chat', badge: true },
    { label: 'Meu Perfil', to: '/app/profile/edit' },
  ],
  producer: [
    { label: 'Mapa', to: '/app/map' },
    { label: 'Propostas', to: '/app/proposals' },
    { label: 'Chat', to: '/app/chat', badge: true },
    { label: 'Meu Perfil', to: '/app/profile/edit' },
  ],
  admin: [
    { label: 'Dashboard Admin', to: '/app/admin' },
    { label: 'Moderação', to: '/app/admin/moderation' },
    { label: 'Denúncias', to: '/app/admin/reports' },
  ],
} as const;

export function Navigation() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const unreadCount = useUnreadCount();

  const handleLogout = () => {
    logout();
    void navigate('/', { replace: true });
  };

  const items = user?.isAdmin
    ? NAV_ITEMS.admin
    : user?.profileType
      ? NAV_ITEMS[user.profileType]
      : [];

  return (
    <nav
      className="flex items-center gap-1 px-4 py-3 justify-between"
      style={{ backgroundColor: '#1a1a1a', borderBottom: '2px solid #F2CF1D' }}
      aria-label="Navegação principal"
    >
      <span
        className="font-bold text-sm"
        style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}
      >
        GarageDom
      </span>

      <ul className="flex items-center gap-1" role="list">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className="relative px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2"
              style={({ isActive }) => ({
                color: isActive ? '#0D0D0D' : '#F2CF1D',
                backgroundColor: isActive ? '#F2CF1D' : 'transparent',
                border: '2px solid #F2CF1D',
              })}
            >
              {item.label}
              {'badge' in item && item.badge && unreadCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full"
                  style={{ backgroundColor: '#ef4444', color: '#fff' }}
                  aria-label={`${unreadCount} mensagens não lidas`}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <button
        onClick={handleLogout}
        className="px-3 py-1.5 text-xs font-medium focus-visible:outline focus-visible:outline-2"
        style={{ color: '#9ca3af', border: '2px solid #374151', backgroundColor: 'transparent' }}
      >
        Sair
      </button>
    </nav>
  );
}
