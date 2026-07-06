import { useWeatherContext } from '../context/WeatherContext';
import { useNavigate } from 'react-router-dom';
import { Wind, Droplets, SunDim, Eye, ThermometerSun, CloudRain, Activity } from 'lucide-react';

export default function DetailsView() {
  const { data } = useWeatherContext();
  const navigate = useNavigate();

  if (!data) return null;

  const todayStr = new Date().toISOString().substring(0, 10);
  const todayIndex = data.daily.time.findIndex(t => t.startsWith(todayStr)) || 0;

  const weatherItems = [
    { id: 'temp', title: 'Temperatur', icon: ThermometerSun, value: `${Math.round(data.current.temp)}°` },
    { id: 'wind', title: 'Vind', icon: Wind, value: `${Math.round(data.current.windSpeed)} m/s` },
    { id: 'humidity', title: 'Luftfuktighet', icon: Droplets, value: `${data.current.humidity}%` },
    { id: 'pressure', title: 'Lufttryck', icon: Activity, value: `${Math.round(data.current.pressure)} hPa` },
    { id: 'uv_custom', title: 'UV-index', icon: SunDim, value: data.current.uvIndex },
    { id: 'precipitation', title: 'Nederbörd', icon: CloudRain, value: `${data.current.precipitation} mm` },
    { id: 'visibility', title: 'Sikt', icon: Eye, value: `${(data.current.visibility / 1000).toFixed(1)} km` },
  ];

  const airItems = [
    { id: 'aqi', title: 'AQI (Luft)', icon: Wind, value: data.airQuality?.aqi?.[0] || '-' },
    { id: 'pm', title: 'PM10 / PM2.5', icon: Activity, value: data.airQuality?.pm10?.[0] ? `${Math.round(data.airQuality.pm10[0])} / ${Math.round(data.airQuality.pm2_5[0])}` : '-' },
    { id: 'pollen_birch', title: 'Björkpollen', icon: Activity, value: data.airQuality?.birchPollen?.[0] ? `${data.airQuality.birchPollen[0]} µg/m³` : 'Ingen' },
    { id: 'pollen_grass', title: 'Gräspollen', icon: Activity, value: data.airQuality?.grassPollen?.[0] ? `${data.airQuality.grassPollen[0]} µg/m³` : 'Ingen' },
  ];

  const astroItems = [
    { id: 'sunrise', title: 'Soluppgång', icon: SunDim, value: data.daily.sunrise?.[todayIndex] ? new Date(data.daily.sunrise[todayIndex]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-' },
    { id: 'sunset', title: 'Solnedgång', icon: SunDim, value: data.daily.sunset?.[todayIndex] ? new Date(data.daily.sunset[todayIndex]).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-' },
    { id: 'sunshine', title: 'Soltimmar', icon: SunDim, value: data.daily.sunshineDuration?.[todayIndex] ? `${(data.daily.sunshineDuration[todayIndex] / 3600).toFixed(1)} h` : '-' },
  ];

  const renderGrid = (list: any[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
      {list.map(item => {
        const Icon = item.icon;
        return (
          <button 
            key={item.id} 
            className="surface-card flex-col" 
            style={{ alignItems: 'center', gap: '12px', padding: '32px 16px', cursor: item.id.includes('pollen') || item.id === 'aqi' || item.id.includes('sunrise') ? 'default' : 'pointer' }}
            onClick={() => {
               if (item.id === 'uv_custom') navigate('/uv');
               else if (['temp', 'wind', 'humidity', 'pressure', 'precipitation', 'visibility', 'aqi', 'pollen_birch', 'pollen_grass'].includes(item.id)) navigate(`/param/${item.id}`);
            }}
          >
            <Icon size={32} strokeWidth={1.5} className="text-muted" />
            <span className="text-md font-medium text-muted">{item.title}</span>
            <span className="text-2xl font-bold">{item.value}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="section-header" style={{ marginTop: '20px' }}>Detaljerad Vädermetrik</div>
      {renderGrid(weatherItems)}
      
      <div className="section-header">Luftkvalitet & Pollen</div>
      {renderGrid(airItems)}

      <div className="section-header">Astronomi</div>
      {renderGrid(astroItems)}
    </div>
  );
}
