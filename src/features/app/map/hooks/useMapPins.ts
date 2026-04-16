import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { mapPinsSchema, type MapPin } from '@/lib/schemas/mapSchema';

interface MapFilters {
  profile_type?: string;
  city?: string;
}

export function useMapPins(filters: MapFilters = {}) {
  return useQuery({
    queryKey: ['map-pins', filters],
    queryFn: async (): Promise<MapPin[]> => {
      const { data } = await apiClient.get('/api/v1/map/pins', { params: filters });
      return mapPinsSchema.parse(data);
    },
    staleTime: 30_000,
  });
}
