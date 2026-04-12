import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  profileSchema,
  publicProfileSchema,
  type Profile,
  type UpdateProfileInput,
  type PublicProfile,
} from '@/lib/schemas/profileSchema';

export function useProfile(id: number) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/v1/profiles/${id}`);
      return profileSchema.parse(data);
    },
    enabled: !!id,
  });
}

export function useUpdateProfile(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateProfileInput): Promise<Profile> => {
      const { data } = await apiClient.put(`/api/v1/profiles/${id}`, input);
      return profileSchema.parse(data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', id] });
    },
  });
}

export function usePublicProfile(id: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async (): Promise<PublicProfile> => {
      const { data } = await apiClient.get(`/api/v1/profiles/${id}`);
      return publicProfileSchema.parse(data);
    },
    enabled: !!id,
  });
}
