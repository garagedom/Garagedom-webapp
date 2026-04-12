import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProfileSchema, PROFILE_TYPES } from '@/lib/schemas/profileSchema';
import type { CreateProfileInput } from '@/lib/schemas/profileSchema';

const PROFILE_TYPE_LABELS: Record<typeof PROFILE_TYPES[number], string> = {
  band: 'Banda',
  venue: 'Casa de Shows',
  producer: 'Produtor',
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
    defaultValues: {
      name: '',
      profile_type: undefined,
      city: '',
      music_genre: '',
    },
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
      noValidate
    >
      {/* Nome */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="name"
          className="text-sm font-medium"
          style={{ color: '#F2CF1D' }}
        >
          Nome do perfil <span aria-hidden="true">*</span>
        </label>
        <input
          id="name"
          type="text"
          aria-required="true"
          aria-describedby={errors.name ? 'name-error' : undefined}
          className="px-3 py-2 text-sm bg-transparent outline-none"
          style={{
            color: '#f3f4f6',
            border: `2px solid ${errors.name ? '#ef4444' : '#F2CF1D'}`,
          }}
          {...register('name')}
        />
        {errors.name && (
          <span id="name-error" className="text-xs" style={{ color: '#ef4444' }}>
            {errors.name.message}
          </span>
        )}
      </div>

      {/* Tipo de perfil */}
      <fieldset>
        <legend className="text-sm font-medium mb-2" style={{ color: '#F2CF1D' }}>
          Tipo de perfil <span aria-hidden="true">*</span>
        </legend>
        <div className="flex gap-4" role="radiogroup" aria-required="true">
          {PROFILE_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center gap-2 cursor-pointer text-sm"
              style={{ color: '#f3f4f6' }}
            >
              <input
                type="radio"
                value={type}
                style={{ accentColor: '#F2CF1D' }}
                {...register('profile_type')}
              />
              {PROFILE_TYPE_LABELS[type]}
            </label>
          ))}
        </div>
        {errors.profile_type && (
          <span className="text-xs mt-1 block" style={{ color: '#ef4444' }}>
            {errors.profile_type.message}
          </span>
        )}
      </fieldset>

      {/* Cidade */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="city"
          className="text-sm font-medium"
          style={{ color: '#F2CF1D' }}
        >
          Cidade <span aria-hidden="true">*</span>
        </label>
        <input
          id="city"
          type="text"
          aria-required="true"
          aria-describedby={errors.city ? 'city-error' : undefined}
          className="px-3 py-2 text-sm bg-transparent outline-none"
          style={{
            color: '#f3f4f6',
            border: `2px solid ${errors.city ? '#ef4444' : '#F2CF1D'}`,
          }}
          {...register('city')}
        />
        {errors.city && (
          <span id="city-error" className="text-xs" style={{ color: '#ef4444' }}>
            {errors.city.message}
          </span>
        )}
      </div>

      {/* Gênero musical (opcional) */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="music_genre"
          className="text-sm font-medium"
          style={{ color: '#F2CF1D' }}
        >
          Gênero musical{' '}
          <span className="text-xs font-normal" style={{ color: '#9ca3af' }}>
            (opcional)
          </span>
        </label>
        <input
          id="music_genre"
          type="text"
          placeholder="Ex: Rock, Sertanejo, MPB..."
          className="px-3 py-2 text-sm bg-transparent outline-none"
          style={{
            color: '#f3f4f6',
            border: '2px solid #F2CF1D',
          }}
          {...register('music_genre')}
        />
      </div>

      {/* Erro de API */}
      {apiError && (
        <p role="alert" className="text-sm text-center" style={{ color: '#ef4444' }}>
          {apiError}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:translate-x-[2px] active:translate-y-[2px]"
        style={{
          backgroundColor: '#F2CF1D',
          color: '#0D0D0D',
          border: '2px solid #0D0D0D',
          boxShadow: '4px 4px 0 #403208',
        }}
      >
        {isSubmitting ? 'Criando perfil...' : 'Criar perfil'}
      </button>
    </form>
  );
}
