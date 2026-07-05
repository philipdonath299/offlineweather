import { WeatherData } from '../types/weather';
import { getWeatherDescription, getWeatherIcon } from '../utils/weatherCodes';

interface CurrentWeatherProps {
  data: WeatherData;
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  const Icon = getWeatherIcon(data.current.weatherCode);
  const description = getWeatherDescription(data.current.weatherCode);

  return (
    <div className="flex-col flex-center" style={{ margin: '40px 0' }}>
      <h1 className="text-2xl font-medium" style={{ marginBottom: '8px' }}>
        {data.location.name}
      </h1>
      
      <div className="flex-center" style={{ gap: '16px', marginBottom: '16px' }}>
        <Icon size={48} strokeWidth={1.5} />
        <span className="text-6xl">{Math.round(data.current.temp)}°</span>
      </div>

      <p className="text-lg font-medium">{description}</p>
      
      <div className="flex-center text-muted" style={{ gap: '16px', marginTop: '8px' }}>
        <span>H: {Math.round(data.daily.tempMax[0])}°</span>
        <span>L: {Math.round(data.daily.tempMin[0])}°</span>
      </div>
    </div>
  );
}
