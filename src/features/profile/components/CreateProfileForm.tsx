import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProfileSchema, PROFILE_TYPES } from '@/lib/schemas/profileSchema';
import type { CreateProfileInput } from '@/lib/schemas/profileSchema';

const TYPE_CONFIG: Record<
  typeof PROFILE_TYPES[number],
  { label: string; icon: React.ReactNode }
> = {
  band: {
    label: 'Banda /\nMúsico',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 3a1 1 0 00-1 1v8.268a3 3 0 104.001 2.8V9h3V7h-4V4a1 1 0 00-1-1H9z" />
      </svg>
    ),
  },
  venue: {
    label: 'Casa de\nShows',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  producer: {
    label: 'Produtor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18v-6a9 9 0 0118 0v6" />
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z" />
        <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" />
      </svg>
    ),
  },
};

interface CreateProfileFormProps {
  onSubmit: (data: CreateProfileInput) => Promise<void>;
  apiError?: string;
}

export function CreateProfileForm({ onSubmit, apiError }: CreateProfileFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProfileInput>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: { name: '', profile_type: undefined, city: '', music_genre: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>

      {/* Nome */}
      <div className="cp-field">
        <label htmlFor="cp-name">Nome do perfil <span style={{ color: '#4b5563', fontWeight: 400 }}>*</span></label>
        <input
          id="cp-name"
          type="text"
          placeholder="Ex: The Garage Dogs, Studio 88..."
          className={`cp-input${errors.name ? ' error' : ''}`}
          aria-required="true"
          aria-describedby={errors.name ? 'cp-name-err' : undefined}
          {...register('name')}
        />
        {errors.name && <div id="cp-name-err" className="cp-field-error">{errors.name.message}</div>}
      </div>

      {/* Tipo de perfil */}
      <div className="cp-field">
        <label>Tipo de perfil <span style={{ color: '#4b5563', fontWeight: 400 }}>*</span></label>
        <div className={`cp-type-grid${errors.profile_type ? ' error' : ''}`} role="radiogroup" aria-required="true">
          {PROFILE_TYPES.map((type) => {
            const { label, icon } = TYPE_CONFIG[type];
            return (
              <div key={type} className="cp-type-opt">
                <input
                  type="radio"
                  id={`cp-type-${type}`}
                  className="cp-type-radio"
                  {...register('profile_type')}
                  value={type}
                />
                <label htmlFor={`cp-type-${type}`} className="cp-type-label">
                  {icon}
                  {label.split('\n').map((line, i) => <span key={i}>{line}</span>)}
                </label>
              </div>
            );
          })}
        </div>
        {errors.profile_type && (
          <div className="cp-field-error">{errors.profile_type.message}</div>
        )}
      </div>

      {/* Cidade */}
      <div className="cp-field">
        <label htmlFor="cp-city">Cidade <span style={{ color: '#4b5563', fontWeight: 400 }}>*</span></label>
        <input
          id="cp-city"
          type="text"
          placeholder="Ex: São Paulo, SP"
          className={`cp-input${errors.city ? ' error' : ''}`}
          aria-required="true"
          aria-describedby={errors.city ? 'cp-city-err' : undefined}
          {...register('city')}
        />
        {errors.city && <div id="cp-city-err" className="cp-field-error">{errors.city.message}</div>}
      </div>

      {/* Gênero musical */}
      <div className="cp-field">
        <label htmlFor="cp-genre">
          Gênero musical <span className="opt">(opcional)</span>
        </label>
        <input
          id="cp-genre"
          type="text"
          placeholder="Ex: Rock, Sertanejo, MPB..."
          className="cp-input"
          {...register('music_genre')}
        />
      </div>

      {apiError && <div className="cp-root-error" role="alert">{apiError}</div>}

      <button type="submit" disabled={isSubmitting} className="cp-submit">
        {isSubmitting ? 'Criando perfil...' : 'Criar perfil →'}
      </button>
    </form>
  );
}
