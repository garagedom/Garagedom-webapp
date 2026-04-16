import { z } from 'zod';

export const mapPinSchema = z.object({
  id: z.number(),
  name: z.string(),
  profile_type: z.enum(['band', 'venue', 'producer']),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string().nullable(),
  music_genre: z.string().nullable(),
  logo_url: z.string().nullable(),
});

export type MapPin = z.infer<typeof mapPinSchema>;
export const mapPinsSchema = z.array(mapPinSchema);
