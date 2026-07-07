import { WeatherData } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherCodes';

interface HourlyForecastProps {
  data: WeatherData;
  targetDate?: string;
}

export default function HourlyForecast({ data, targetDate }: HourlyForecastProps) {
  let startIndex = 0;
  let showNow = false;

  if (targetDate) {
    startIndex = data.hourly.time.findIndex((t: string) => t.startsWith(targetDate));
    if (startIndex === -1) startIndex = 0;
  } else {
    const now = new Date();
    const currentHourString = now.toISOString().substring(0, 14) + '00';
    startIndex = data.hourly.time.findIndex((t: string) => t >= currentHourString);
    if (startIndex === -1) startIndex = 0;
    showNow = true;
  }
  
  const hoursToShow = data.hourly.time.slice(startIndex, startIndex + 24).map((time: string, i: number) => {
    const index = startIndex + i;
    return {
      time: new Date(time).getHours().toString().padStart(2, '0') + ':00',
      temp: data.hourly.temp[index],
      weatherCode: data.hourly.weatherCode[index],
      precipProb: data.hourly.precipitationProbability[index],
    };
  });

  return (
    <div className={targetDate ? '' : 'surface-card'} style={targetDate ? { paddingTop: '16px' } : { padding: '24px' }}>
      {!targetDate && <div className="section-header">Timprognos</div>}
      <div style={{ display: 'flex', gap: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {hoursToShow.map((hour, i) => {
          const Icon = getWeatherIcon(hour.weatherCode);
          return (
            <div key={i} className="flex-col flex-center" style={{ minWidth: '40px', gap: '16px' }}>
              <span className="text-sm font-medium text-muted">{showNow && i === 0 ? 'Nu' : hour.time}</span>
              <Icon size={24} strokeWidth={1.5} className="text-muted" />
              <span className="text-xl font-semibold">{Math.round(hour.temp)}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
