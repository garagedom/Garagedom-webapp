import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileInput, type Profile } from '@/lib/schemas/profileSchema';
import { useUpdateProfile } from '../hooks/useProfile';
import { VisibilityToggle } from './VisibilityToggle';
import { LogoUpload } from './LogoUpload';

interface EditProfileFormProps {
  profile: Profile;
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [successMsg, setSuccessMsg] = useState('');
  const [isVisible, setIsVisible] = useState(profile.map_visible);
  const { mutate: updateProfile, isPending, isError } = useUpdateProfile(profile.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      bio: profile.bio ?? '',
      city: profile.city,
      music_genre: profile.music_genre ?? '',
      members: '',
      map_visible: profile.map_visible,
    },
  });

  // Sync form when profile data changes
  useEffect(() => {
    reset({
      name: profile.name,
      bio: profile.bio ?? '',
      city: profile.city,
      music_genre: profile.music_genre ?? '',
      members: '',
      map_visible: profile.map_visible,
    });
    setIsVisible(profile.map_visible);
  }, [profile, reset]);

  const onSubmit = (data: UpdateProfileInput) => {
    setSuccessMsg('');
    updateProfile(
      { ...data, map_visible: isVisible },
      {
        onSuccess: () => setSuccessMsg('Perfil atualizado com sucesso.'),
        onError: () => setSuccessMsg(''),
      },
    );
  };

  const handleVisibilityChange = (value: boolean) => {
    setIsVisible(value);
    updateProfile(
      { name: profile.name, city: profile.city, map_visible: value },
      {
        onSuccess: () => setSuccessMsg('Configuração de privacidade atualizada.'),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {/* Logo Upload */}
      <div className="flex justify-center py-2">
        <LogoUpload
          profileId={profile.id}
          profileName={profile.name}
          currentLogoUrl={profile.logo_url}
        />
      </div>

      {/* Nome */}
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>Nome *</label>
        <input
          id="name"
          type="text"
          className="px-3 py-2 text-sm bg-transparent outline-none"
          style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
          {...register('name')}
        />
        {errors.name && <span className="text-xs" style={{ color: '#ef4444' }}>{errors.name.message}</span>}
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1">
        <label htmlFor="bio" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>Bio</label>
        <textarea
          id="bio"
          rows={3}
          className="px-3 py-2 text-sm bg-transparent outline-none resize-none"
          style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
          {...register('bio')}
        />
      </div>

      {/* Cidade */}
      <div className="flex flex-col gap-1">
        <label htmlFor="city" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>Cidade *</label>
        <input
          id="city"
          type="text"
          className="px-3 py-2 text-sm bg-transparent outline-none"
          style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
          {...register('city')}
        />
        {errors.city && <span className="text-xs" style={{ color: '#ef4444' }}>{errors.city.message}</span>}
      </div>

      {/* Gênero Musical */}
      <div className="flex flex-col gap-1">
        <label htmlFor="music_genre" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>Gênero musical</label>
        <input
          id="music_genre"
          type="text"
          className="px-3 py-2 text-sm bg-transparent outline-none"
          style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
          {...register('music_genre')}
        />
      </div>

      {/* Membros — apenas para banda */}
      {profile.profile_type === 'band' && (
        <div className="flex flex-col gap-1">
          <label htmlFor="members" className="text-sm font-medium" style={{ color: '#F2CF1D' }}>
            Membros <span className="font-normal text-xs" style={{ color: '#6b7280' }}>(um por linha)</span>
          </label>
          <textarea
            id="members"
            rows={3}
            className="px-3 py-2 text-sm bg-transparent outline-none resize-none"
            style={{ color: '#f3f4f6', border: '2px solid #F2CF1D' }}
            {...register('members')}
          />
        </div>
      )}

      {/* Visibilidade do Pin (3.4) */}
      <div className="py-2" style={{ borderTop: '1px solid #374151' }}>
        <p className="text-xs font-semibold uppercase mb-3" style={{ color: '#6b7280' }}>Privacidade</p>
        <VisibilityToggle
          isVisible={isVisible}
          isPending={isPending}
          onChange={handleVisibilityChange}
        />
      </div>

      {successMsg && (
        <p className="text-sm text-center" style={{ color: '#4ade80' }}>{successMsg}</p>
      )}
      {isError && !successMsg && (
        <p className="text-sm text-center" style={{ color: '#ef4444' }}>Erro ao salvar. Tente novamente.</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-6 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: '#F2CF1D',
          color: '#0D0D0D',
          border: '2px solid #0D0D0D',
          boxShadow: '4px 4px 0 #F2CF1D',
        }}
      >
        {isPending ? 'Salvando...' : 'Salvar'}
      </button>
    </form>
  );
}
