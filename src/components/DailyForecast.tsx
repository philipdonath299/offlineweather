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
    <div className="surface-card" style={{ padding: '16px 24px' }}>
      <div className="section-header" style={{ marginTop: '8px' }}>10-dygnsprognos</div>
      <div className="flex-col">
        {days.map((day, i) => {
          const Icon = getWeatherIcon(day.weatherCode);
          return (
            <div key={i} className="list-item flex-between">
              <span className="text-md font-medium" style={{ width: '70px' }}>{day.dayName}</span>
              <div className="flex-center" style={{ width: '40px' }}>
                <Icon size={20} strokeWidth={1.5} className="text-muted" />
              </div>
              <span className="text-sm text-muted" style={{ width: '50px', textAlign: 'right' }}>
                {day.precipProb > 0 ? `${day.precipProb}%` : ''}
              </span>
              <div className="flex-center" style={{ gap: '16px', width: '100px', justifyContent: 'flex-end' }}>
                <span className="text-muted">{Math.round(day.tempMin)}°</span>
                <span className="font-semibold">{Math.round(day.tempMax)}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
