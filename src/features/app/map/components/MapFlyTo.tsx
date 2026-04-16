import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapFlyToProps {
  lat: number | null;
  lon: number | null;
}

export function MapFlyTo({ lat, lon }: MapFlyToProps) {
  const map = useMap();
  useEffect(() => {
    if (lat !== null && lon !== null) {
      map.flyTo([lat, lon], 13, { animate: true, duration: 1 });
    }
  }, [map, lat, lon]);
  return null;
}
