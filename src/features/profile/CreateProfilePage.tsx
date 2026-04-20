import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useCreateProfile } from './hooks/useCreateProfile';
import { CreateProfileForm } from './components/CreateProfileForm';
import type { CreateProfileInput } from '@/lib/schemas/profileSchema';
import './CreateProfile.css';

const PHOTOS = [
  'https://images.unsplash.com/photo-1598387993441-a364f854cfba?w=1400&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1468164016595-6108e4c60753?w=1400&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=1400&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1415886824302-12b77ee82f51?w=1400&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1504704911898-68304a7d2807?w=1400&h=1000&fit=crop',
  'https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=1400&h=1000&fit=crop',
];

const bgPhoto = PHOTOS[Math.floor(Math.random() * PHOTOS.length)];

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [apiError, setApiError] = useState<string | undefined>();
  const [imgLoaded, setImgLoaded] = useState(false);
  const { mutateAsync } = useCreateProfile();

  if (user?.profileId) {
    return <Navigate to="/app/map" replace />;
  }

  const handleSubmit = async (data: CreateProfileInput) => {
    setApiError(undefined);
    try {
      await mutateAsync(data);
      void navigate('/app/map', { replace: true });
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { errors?: string[]; error?: string; code?: string } } };
        if (axiosErr.response?.data?.code === 'profile_already_exists') {
          void navigate('/app/map', { replace: true });
          return;
        }
        const errors = axiosErr.response?.data?.errors;
        const message =
          Array.isArray(errors) && errors.length > 0
            ? errors[0]
            : (axiosErr.response?.data?.error ?? 'Erro ao criar perfil. Tente novamente.');
        setApiError(message);
      } else {
        setApiError('Erro de conexão. Verifique sua internet.');
      }
    }
  };

  return (
    <div className="cp-root">
      {/* LEFT: visual */}
      <div className="cp-visual">
        <div
          className={`cp-visual-img${imgLoaded ? ' loaded' : ''}`}
          style={{ backgroundImage: `url('${bgPhoto}')` }}
        >
          <img
            src={bgPhoto}
            alt=""
            style={{ display: 'none' }}
            onLoad={() => setImgLoaded(true)}
          />
        </div>
        <div className="cp-visual-overlay" />

        <div className="cp-steps-row">
          <div className="cp-sdot done" />
          <div className="cp-sdot active" />
          <div className="cp-sdot" />
          <span className="cp-step-label">Passo 2 de 3</span>
        </div>

        <div className="cp-visual-content">
          <div className="cp-step-tag">Criar Perfil</div>
          <h1>
            QUEM É<br />
            <span>VOCÊ NA</span><br />
            CENA?
          </h1>
          <p>Seu perfil é seu cartão de visita. Quanto mais completo, mais fácil de te encontrarem no mapa.</p>
        </div>
      </div>

      {/* RIGHT: form */}
      <div className="cp-form-panel">
        <div className="cp-brand">GarageDom</div>
        <div className="cp-form-heading">CRIE SEU<br />PERFIL</div>
        <div className="cp-form-sub">Conte-nos quem você é na cena</div>

        <CreateProfileForm onSubmit={handleSubmit} apiError={apiError} />

        <div className="cp-form-footer">Você pode editar seu perfil a qualquer momento</div>
      </div>
    </div>
  );
}
