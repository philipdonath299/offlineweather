import { WeatherData } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherCodes';

interface HourlyForecastProps {
  data: WeatherData;
}

export default function HourlyForecast({ data }: HourlyForecastProps) {
  // Filtrera så vi bara visar kommande 24 timmar
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
    <div className="glass-panel" style={{ overflowX: 'auto', paddingBottom: '16px' }}>
      <h3 className="text-sm text-muted font-medium" style={{ marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Timprognos
      </h3>
      <div style={{ display: 'flex', gap: '24px', minWidth: 'min-content' }}>
        {hoursToShow.map((hour, i) => {
          const Icon = getWeatherIcon(hour.weatherCode);
          return (
            <div key={i} className="flex-col flex-center" style={{ minWidth: '48px', gap: '12px' }}>
              <span className="text-sm font-medium">{i === 0 ? 'Nu' : hour.time}</span>
              <Icon size={24} strokeWidth={1.5} />
              <span className="text-lg font-bold">{Math.round(hour.temp)}°</span>
              {hour.precipProb > 0 && (
                <span className="text-xs text-muted" style={{ color: '#4a90e2' }}>{hour.precipProb}%</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
