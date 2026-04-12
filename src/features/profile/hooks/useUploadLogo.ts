import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg'];

export function validateLogoFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_SIZE) {
    return 'Arquivo inválido. Use PNG ou JPG com no máximo 5MB.';
  }
  return null;
}

export function useUploadLogo(profileId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('logo', file);
      const { data } = await apiClient.post<{ logo_url: string }>(
        `/api/v1/profiles/${profileId}/logo`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
    },
  });
}
