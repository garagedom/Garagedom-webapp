import { ProfileAvatar } from '@/components/ProfileAvatar';
import type { PublicProfile } from '@/lib/schemas/profileSchema';

const PROFILE_TYPE_LABEL: Record<string, string> = {
  band: 'Banda',
  venue: 'Venue',
  producer: 'Produtor',
};

interface ProfileHeaderProps {
  profile: PublicProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ProfileAvatar name={profile.name} logoUrl={profile.logo_url} size="lg" />

      <div>
        <h1 className="text-xl font-bold" style={{ color: '#F2CF1D', fontFamily: 'Geist Variable, sans-serif' }}>
          {profile.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
          {PROFILE_TYPE_LABEL[profile.profile_type]} · {profile.city}
        </p>
        {profile.music_genre && (
          <p className="text-xs mt-1" style={{ color: '#6b7280' }}>{profile.music_genre}</p>
        )}
      </div>

      {profile.bio && (
        <p className="text-sm text-center max-w-xs" style={{ color: '#d1d5db' }}>{profile.bio}</p>
      )}
    </div>
  );
}
