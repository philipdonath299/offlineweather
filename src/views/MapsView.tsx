import { useWeatherContext } from '../context/WeatherContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fixa default-ikoner för Leaflet i React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

export default function MapsView() {
  const { location } = useWeatherContext();

  if (!location) return null;
  const center: [number, number] = [location.latitude, location.longitude];

  // RainViewer tile URL för radar
  // Obs: RainViewer uppdateras dynamiskt, detta är en förenklad integration

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: 'calc(100vh - 200px)' }}>
      <div className="section-header" style={{ marginTop: '20px' }}>Väderkarta & Radar</div>
      
      <div className="surface-card" style={{ padding: '0', overflow: 'hidden', height: '100%', borderRadius: '16px' }}>
        <MapContainer center={center} zoom={6} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <ChangeView center={center} />
          {/* Mörk bas-karta från CartoDB */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {/* Regnradar (demo) */}
          <TileLayer
            url="https://tilecache.rainviewer.com/v2/radar/1720202400/256/{z}/{x}/{y}/2/1_1.png"
            opacity={0.6}
          />
          <Marker position={center}>
            <Popup>
              {location.name}
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
