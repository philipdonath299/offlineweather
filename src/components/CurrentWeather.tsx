import { WeatherData } from '../types/weather';
import { getWeatherDescription } from '../utils/weatherCodes';

interface CurrentWeatherProps {
  data: WeatherData;
}

export default function CurrentWeather({ data }: CurrentWeatherProps) {
  const description = getWeatherDescription(data.current.weatherCode);

  return (
    <div className="flex-col flex-center" style={{ margin: '40px 0 20px 0', gap: '12px' }}>
      <h1 className="text-3xl font-bold">{data.location.name}</h1>
      <p className="text-md text-muted font-medium">
        {Math.round(data.current.temp)}° · {description}
      </p>
    </div>
  );
}
