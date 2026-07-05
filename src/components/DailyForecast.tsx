import { WeatherData } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherCodes';

interface DailyForecastProps {
  data: WeatherData;
}

export default function DailyForecast({ data }: DailyForecastProps) {
  const days = data.daily.time.map((time, i) => {
    const date = new Date(time);
    const dayName = i === 0 ? 'Idag' : new Intl.DateTimeFormat('sv-SE', { weekday: 'short' }).format(date);
    
    return {
      dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
      tempMax: data.daily.tempMax[i],
      tempMin: data.daily.tempMin[i],
      weatherCode: data.daily.weatherCode[i],
      precipProb: data.daily.precipitationProbability[i],
    };
  });

  return (
    <div className="glass-panel">
      <h3 className="text-sm text-muted font-medium" style={{ marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
        10-dygnsprognos
      </h3>
      <div className="flex-col" style={{ gap: '16px' }}>
        {days.map((day, i) => {
          const Icon = getWeatherIcon(day.weatherCode);
          return (
            <div key={i} className="flex-between">
              <span className="text-md font-medium" style={{ width: '60px' }}>{day.dayName}</span>
              <div className="flex-center" style={{ width: '40px' }}>
                <Icon size={20} strokeWidth={1.5} />
              </div>
              <span className="text-sm text-muted" style={{ width: '40px', textAlign: 'right', color: day.precipProb > 20 ? '#4a90e2' : 'var(--text-muted)' }}>
                {day.precipProb > 0 ? `${day.precipProb}%` : ''}
              </span>
              <div className="flex-center" style={{ gap: '16px', width: '100px', justifyContent: 'flex-end' }}>
                <span className="text-muted">{Math.round(day.tempMin)}°</span>
                <span className="font-bold">{Math.round(day.tempMax)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
