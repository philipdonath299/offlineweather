import CurrentWeather from '../components/CurrentWeather';
import HourlyForecast from '../components/HourlyForecast';
import WeatherDetails from '../components/WeatherDetails';
import { useWeatherContext } from '../context/WeatherContext';

export default function HomeView() {
  const { data } = useWeatherContext();

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <CurrentWeather data={data} />
      <HourlyForecast data={data} />
      <WeatherDetails data={data} />
    </div>
  );
}
