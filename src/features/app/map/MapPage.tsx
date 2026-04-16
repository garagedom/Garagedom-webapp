import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Navigation } from '@/components/Navigation/Navigation';
import { useAuthStore } from '@/stores/authStore';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useMapPins } from './hooks/useMapPins';
import { useMapChannel } from './hooks/useMapChannel';
import { PinMarker } from './components/PinMarker';
import { MapLoadingOverlay } from './components/MapLoadingOverlay';
import { MapErrorOverlay } from './components/MapErrorOverlay';
import { ProfilePopup } from './components/ProfilePopup';
import { MapFilters } from './components/MapFilters';
import { CitySearch } from './components/CitySearch';
import { MapFlyTo } from './components/MapFlyTo';
import { HiddenPinBanner } from './components/HiddenPinBanner';
import type { MapPin } from '@/lib/schemas/mapSchema';

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  useMapEvents({ click: onMapClick });
  return null;
}

interface FlyToTarget {
  lat: number;
  lon: number;
}

export default function MapPage() {
  const { data: allPins, isLoading, isError, refetch } = useMapPins();
  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [flyTo, setFlyTo] = useState<FlyToTarget | null>(null);

  const user = useAuthStore((s) => s.user);
  const { data: ownProfile } = useProfile(user?.profileId ?? 0);

  useMapChannel();

  const showHiddenBanner =
    ownProfile != null && !ownProfile.map_visible && user?.profileId != null;

  const filteredPins = useMemo(
    () =>
      activeFilter === 'all'
        ? allPins
        : allPins?.filter((p) => p.profile_type === activeFilter),
    [allPins, activeFilter],
  );

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0D0D0D' }}>
      <Navigation />
      <main className="flex-1 relative min-h-0">
        {isLoading && <MapLoadingOverlay />}
        {isError && <MapErrorOverlay onRetry={() => void refetch()} />}

        {/* Barra de controles sobreposta */}
        <div
          className="absolute top-3 left-3 z-[1000] flex gap-2 flex-wrap items-center"
          style={{ pointerEvents: 'auto' }}
        >
          <MapFilters active={activeFilter} onChange={setActiveFilter} />
          <CitySearch onSelect={(lat, lon) => setFlyTo({ lat, lon })} />
        </div>

        <MapContainer
          center={[-23.55, -46.63]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onMapClick={() => setSelectedPin(null)} />
          <MapFlyTo lat={flyTo?.lat ?? null} lon={flyTo?.lon ?? null} />
          <MarkerClusterGroup chunkedLoading>
            {filteredPins?.map((pin) => (
              <PinMarker key={pin.id} pin={pin} onClick={setSelectedPin} />
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {selectedPin && (
          <ProfilePopup pin={selectedPin} onClose={() => setSelectedPin(null)} />
        )}

        {showHiddenBanner && (
          <HiddenPinBanner profileId={user!.profileId!} />
        )}
      </main>
    </div>
  );
}
