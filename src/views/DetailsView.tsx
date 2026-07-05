import { useWeatherContext } from '../context/WeatherContext';
import { useNavigate } from 'react-router-dom';
import { Wind, Droplets, SunDim, Eye, ThermometerSun, CloudRain, Activity } from 'lucide-react';

export default function DetailsView() {
  const { data } = useWeatherContext();
  const navigate = useNavigate();

  if (!data) return null;

  const items = [
    { id: 'temp', title: 'Temperatur', icon: ThermometerSun, value: `${Math.round(data.current.temp)}°` },
    { id: 'wind', title: 'Vind', icon: Wind, value: `${Math.round(data.current.windSpeed)} m/s` },
    { id: 'humidity', title: 'Luftfuktighet', icon: Droplets, value: `${data.current.humidity}%` },
    { id: 'pressure', title: 'Lufttryck', icon: Activity, value: `${Math.round(data.current.pressure)} hPa` },
    { id: 'uv_custom', title: 'UV-index', icon: SunDim, value: data.current.uvIndex },
    { id: 'precipitation', title: 'Nederbörd', icon: CloudRain, value: `${data.current.precipitation} mm` },
    { id: 'visibility', title: 'Sikt', icon: Eye, value: `${(data.current.visibility / 1000).toFixed(1)} km` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="section-header" style={{ marginTop: '20px' }}>Detaljerad Vädermetrik</div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button 
              key={item.id} 
              className="surface-card flex-col" 
              style={{ alignItems: 'center', gap: '12px', padding: '32px 16px' }}
              onClick={() => navigate(item.id === 'uv_custom' ? '/uv' : `/param/${item.id}`)}
            >
              <Icon size={32} strokeWidth={1.5} className="text-muted" />
              <span className="text-md font-medium text-muted">{item.title}</span>
              <span className="text-2xl font-bold">{item.value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
