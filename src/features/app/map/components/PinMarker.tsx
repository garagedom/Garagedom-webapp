import { divIcon } from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Marker } from 'react-leaflet';
import { ProfileAvatar } from '@/components/ProfileAvatar';
import type { MapPin } from '@/lib/schemas/mapSchema';

function createPinIcon(pin: MapPin) {
  const html = renderToStaticMarkup(
    <div
      style={{
        width: 40,
        height: 40,
        border: '2px solid #F2CF1D',
        borderRadius: '50%',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
      }}
    >
      <ProfileAvatar name={pin.name} logoUrl={pin.logo_url} size="sm" />
    </div>,
  );
  return divIcon({ html, className: '', iconSize: [40, 40], iconAnchor: [20, 20] });
}

interface PinMarkerProps {
  pin: MapPin;
  onClick: (pin: MapPin) => void;
}

export function PinMarker({ pin, onClick }: PinMarkerProps) {
  return (
    <Marker
      position={[pin.latitude, pin.longitude]}
      icon={createPinIcon(pin)}
      eventHandlers={{ click: () => onClick(pin) }}
    />
  );
}
