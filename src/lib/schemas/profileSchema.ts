import { z } from 'zod';

export const PROFILE_TYPES = ['band', 'venue', 'producer'] as const;

export const profileTypeSchema = z.enum(PROFILE_TYPES);

// Nomes de campo conforme o backend Rails (serializer + DB):
// music_genre (não musical_genre), map_visible (não is_visible)
export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_type: profileTypeSchema,
  city: z.string(),
  music_genre: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  logo_url: z.string().nullable().optional(),
  map_visible: z.boolean(),
  created_at: z.string(),
});

// Payload enviado para POST /api/v1/profiles (flat, sem wrapper { profile: })
export const createProfileSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  profile_type: z.enum(PROFILE_TYPES, {
    message: 'Selecione o tipo de perfil para continuar',
  }),
  city: z.string().min(1, 'A cidade é obrigatória'),
  music_genre: z.string().optional(),
});

// Payload enviado para PUT /api/v1/profiles/:id (flat, sem wrapper)
export const updateProfileSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  bio: z.string().max(500).optional(),
  city: z.string().min(1, 'A cidade é obrigatória'),
  music_genre: z.string().optional(),
  members: z.string().optional(),
  map_visible: z.boolean().optional(),
});

export const showHistoryItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  date: z.string(),
  venue_name: z.string().optional(),
});

export const publicProfileSchema = profileSchema.extend({
  shows_history: z.array(showHistoryItemSchema).optional().default([]),
});

export type Profile = z.infer<typeof profileSchema>;
export type PublicProfile = z.infer<typeof publicProfileSchema>;
export type ProfileType = z.infer<typeof profileTypeSchema>;
export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
