import { WeatherData } from '../types/weather';
import { getWeatherDescription } from '../utils/weatherCodes';
import { useWeatherContext } from '../context/WeatherContext';

interface CurrentWeatherProps {
  data: WeatherData;
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  const { setShowSearch } = useWeatherContext();
  const description = getWeatherDescription(data.current.weatherCode);

  // Hitta index för idag (ignorerar historik)
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayIndex = data.daily.time.findIndex(t => t.startsWith(todayStr)) || 0;
  
  const tempMax = data.daily.tempMax[todayIndex !== -1 ? todayIndex : 0];
  const tempMin = data.daily.tempMin[todayIndex !== -1 ? todayIndex : 0];

  return (
    <div className="flex-col flex-center" style={{ margin: '40px 0 20px 0', gap: '12px' }}>
      <h1 
        className="text-3xl font-bold" 
        style={{ cursor: 'pointer' }}
        onClick={() => setShowSearch(true)}
      >
        {data.location.name}
      </h1>
      <p className="text-md text-muted font-medium" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {Math.round(data.current.temp)}° · {description}
      </p>
      
      <div className="flex-center" style={{ gap: '16px', marginTop: '8px' }}>
        <div className="flex-col flex-center">
          <span className="text-sm font-semibold">Max {Math.round(tempMax)}°</span>
          <span className="text-xs text-muted">Min {Math.round(tempMin)}°</span>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--card-border)' }} />
        <div className="flex-col flex-center">
          <span className="text-sm font-semibold">Känns som</span>
          <span className="text-xs text-muted">{Math.round(data.current.feelsLike)}°</span>
        </div>
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--card-border)' }} />
        <div className="flex-col flex-center">
          <span className="text-sm font-semibold">Daggpunkt</span>
          <span className="text-xs text-muted">{Math.round(data.current.dewPoint)}°</span>
        </div>
      </div>
    </div>
  );
}
