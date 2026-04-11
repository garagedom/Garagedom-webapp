import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCreateProfile } from './hooks/useCreateProfile';
import { CreateProfileForm } from './components/CreateProfileForm';
import type { CreateProfileInput } from '@/lib/schemas/profileSchema';

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [apiError, setApiError] = useState<string | undefined>();
  const { mutateAsync } = useCreateProfile();

  // AC8: redireciona para o mapa se o perfil já existe
  if (user?.profileId) {
    return <Navigate to="/app/map" replace />;
  }

  const handleSubmit = async (data: CreateProfileInput) => {
    setApiError(undefined);
    try {
      await mutateAsync(data);
      void navigate('/app/map', { replace: true });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const axiosErr = err as { response?: { data?: { errors?: string[]; error?: string } } };
        const errors = axiosErr.response?.data?.errors;
        const message = Array.isArray(errors) && errors.length > 0
          ? errors[0]
          : (axiosErr.response?.data?.error ?? 'Erro ao criar perfil. Tente novamente.');
        setApiError(message);
      } else {
        setApiError('Erro de conexão. Verifique sua internet.');
      }
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#0D0D0D' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h1
            className="text-3xl font-bold text-center"
            style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}
          >
            GarageDom
          </h1>
          <h2
            className="text-lg font-semibold text-center mt-2"
            style={{ color: '#f3f4f6' }}
          >
            Crie seu perfil
          </h2>
          <p className="text-sm text-center mt-1" style={{ color: '#9ca3af' }}>
            Conte-nos quem você é na cena
          </p>
        </div>

        <CreateProfileForm onSubmit={handleSubmit} apiError={apiError} />
      </div>
    </main>
  );
}
