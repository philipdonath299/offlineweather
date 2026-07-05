import { WeatherData } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherCodes';

interface HourlyForecastProps {
  data: WeatherData;
}

export default function HourlyForecast({ data }: HourlyForecastProps) {
  const now = new Date();
  const currentHourString = now.toISOString().substring(0, 14) + '00';
  
  const startIndex = data.hourly.time.findIndex(t => t >= currentHourString) || 0;
  const hoursToShow = data.hourly.time.slice(startIndex, startIndex + 24).map((time, i) => {
    const index = startIndex + i;
    return {
      time: new Date(time).getHours().toString().padStart(2, '0') + ':00',
      temp: data.hourly.temp[index],
      weatherCode: data.hourly.weatherCode[index],
      precipProb: data.hourly.precipitationProbability[index],
    };
  });

  return (
    <div className="surface-card" style={{ padding: '24px' }}>
      <div className="section-header">Timprognos</div>
      <div style={{ display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {hoursToShow.map((hour, i) => {
          const Icon = getWeatherIcon(hour.weatherCode);
          return (
            <div key={i} className="flex-col flex-center" style={{ minWidth: '40px', gap: '16px' }}>
              <span className="text-sm font-medium text-muted">{i === 0 ? 'Nu' : hour.time}</span>
              <Icon size={24} strokeWidth={1.5} className="text-muted" />
              <span className="text-xl font-semibold">{Math.round(hour.temp)}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
