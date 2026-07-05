import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import { useWeatherContext } from '../context/WeatherContext';

export default function ForecastView() {
  const { data } = useWeatherContext();

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <HourlyForecast data={data} />
      <DailyForecast data={data} />
    </div>
  );
}
