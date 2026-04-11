import { z } from 'zod';

export const PROFILE_TYPES = ['band', 'venue', 'producer'] as const;

export const profileTypeSchema = z.enum(PROFILE_TYPES);

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_type: profileTypeSchema,
  city: z.string(),
  musical_genre: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  logo_url: z.string().nullable().optional(),
  is_visible: z.boolean(),
  created_at: z.string(),
});

export const createProfileSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  profile_type: z.enum(PROFILE_TYPES, {
    message: 'Selecione o tipo de perfil para continuar',
  }),
  city: z.string().min(1, 'A cidade é obrigatória'),
  musical_genre: z.string().optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type ProfileType = z.infer<typeof profileTypeSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
