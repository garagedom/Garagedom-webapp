import { getInitials, getAvatarColor } from '@/lib/avatar';

type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_CLASSES: Record<AvatarSize, { box: string; text: string }> = {
  sm: { box: 'w-8 h-8', text: 'text-xs' },
  md: { box: 'w-12 h-12', text: 'text-sm' },
  lg: { box: 'w-20 h-20', text: 'text-xl' },
};

interface ProfileAvatarProps {
  name: string;
  logoUrl?: string | null;
  size?: AvatarSize;
}

export function ProfileAvatar({ name, logoUrl, size = 'md' }: ProfileAvatarProps) {
  const { box, text } = SIZE_CLASSES[size];

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`Logo de ${name}`}
        className={`${box} rounded-full object-cover`}
        style={{ border: '2px solid #F2CF1D' }}
      />
    );
  }

  const color = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`${box} ${text} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{ backgroundColor: color, color: '#0D0D0D' }}
      aria-label={`Avatar de ${name}`}
      role="img"
    >
      {initials}
    </div>
  );
}
