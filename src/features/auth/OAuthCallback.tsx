import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '@/lib/auth-token';
import { fetchCurrentUser } from './authService';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const isNewUser = searchParams.get('new_user') === 'true';

    if (error || !token) {
      void navigate('/login', {
        replace: true,
        state: { oauthError: 'Não foi possível autenticar. Tente novamente.' },
      });
      return;
    }

    setToken(token);

    fetchCurrentUser()
      .then(() => {
        const destination = isNewUser ? '/app/profile/create' : '/app/map';
        void navigate(destination, { replace: true });
      })
      .catch(() => {
        void navigate('/login', {
          replace: true,
          state: { oauthError: 'Não foi possível autenticar. Tente novamente.' },
        });
      });
  }, [navigate, searchParams]);

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <p style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}>
        Autenticando...
      </p>
    </main>
  );
}
