import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { profileSchema } from '@/lib/schemas/profileSchema';
import { useAuthStore } from '@/stores/authStore';
import type { CreateProfileInput, Profile } from '@/lib/schemas/profileSchema';

async function createProfile(input: CreateProfileInput): Promise<Profile> {
  const { data } = await apiClient.post('/api/v1/profiles', input);
  return profileSchema.parse(data);
}

export function useCreateProfile() {
  const setProfile = useAuthStore((s) => s.setProfile);

  return useMutation({
    mutationFn: createProfile,
    onSuccess: (profile) => {
      setProfile(profile.id, profile.profile_type);
    },
  });
}
