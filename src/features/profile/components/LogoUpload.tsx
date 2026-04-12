import { useRef, useState } from 'react';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import { useUploadLogo, validateLogoFile } from '../hooks/useUploadLogo';

interface LogoUploadProps {
  profileId: number;
  profileName: string;
  currentLogoUrl?: string | null;
}

export function LogoUpload({ profileId, profileName, currentLogoUrl }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState('');
  const { mutate: upload, isPending, isError } = useUploadLogo(profileId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateLogoFile(file);
    if (error) {
      setValidationError(error);
      e.target.value = '';
      return;
    }
    setValidationError('');
    upload(file);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="relative focus-visible:outline focus-visible:outline-2"
        aria-label="Clique para enviar logo do perfil"
        style={{ opacity: isPending ? 0.7 : 1 }}
      >
        <ProfileAvatar name={profileName} logoUrl={currentLogoUrl} size="lg" />
        {isPending && (
          <span
            className="absolute inset-0 flex items-center justify-center rounded-full text-xs font-medium"
            style={{ backgroundColor: 'rgba(13,13,13,0.7)', color: '#F2CF1D' }}
          >
            Enviando...
          </span>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        aria-label="Selecionar imagem de logo"
        onChange={handleFileChange}
      />

      <p className="text-xs" style={{ color: '#6b7280' }}>
        PNG ou JPG · máx. 5MB
      </p>

      {validationError && (
        <p className="text-xs text-center" style={{ color: '#ef4444' }}>{validationError}</p>
      )}
      {isError && !validationError && (
        <p className="text-xs text-center" style={{ color: '#ef4444' }}>
          Erro ao enviar a imagem. Tente novamente.
        </p>
      )}
    </div>
  );
}
