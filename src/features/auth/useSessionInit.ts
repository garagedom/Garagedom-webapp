import { useState, useEffect } from 'react';
import axios from 'axios';
import { setToken } from '@/lib/auth-token';
import { fetchCurrentUser } from './authService';

/**
 * Restaura a sessão silenciosamente ao inicializar o app.
 * Tenta renovar o JWT via cookie httpOnly de refresh token.
 * Retorna `ready: true` quando concluído (com ou sem sessão ativa).
 */
export function useSessionInit() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await axios.post<{ token: string }>(
          `${import.meta.env.VITE_API_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setToken(data.token);
        await fetchCurrentUser();
      } catch {
        // Refresh falhou (cookie expirado ou ausente) — usuário não autenticado
      } finally {
        setReady(true);
      }
    };

    void init();
  }, []);

  return { ready };
}
