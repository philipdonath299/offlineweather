import { useState } from 'react';
import { WeatherData } from '../types/weather';
import { getWeatherIcon } from '../utils/weatherCodes';
import HourlyForecast from './HourlyForecast';

interface DailyForecastProps {
  data: WeatherData;
}

export default function DailyForecast({ data }: DailyForecastProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const todayStr = new Date().toISOString().substring(0, 10);
  const todayIndex = data.daily.time.findIndex(t => t.startsWith(todayStr)) || 0;
  
  let daysToShow;
  if (showHistory) {
    const startIndex = Math.max(0, todayIndex - 7);
    daysToShow = data.daily.time.slice(startIndex, todayIndex).map((time, i) => {
      const realIndex = startIndex + i;
      const date = new Date(time);
      const dayName = new Intl.DateTimeFormat('sv-SE', { weekday: 'short' }).format(date);
      
      return {
        dateStr: time.substring(0, 10),
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        tempMax: data.daily.tempMax[realIndex],
        tempMin: data.daily.tempMin[realIndex],
        weatherCode: data.daily.weatherCode[realIndex],
        precipProb: data.daily.precipitationProbability[realIndex],
      };
    }).reverse();
  } else {
    daysToShow = data.daily.time.slice(todayIndex, todayIndex + 14).map((time, i) => {
      const realIndex = todayIndex + i;
      const date = new Date(time);
      const dayName = i === 0 ? 'Idag' : new Intl.DateTimeFormat('sv-SE', { weekday: 'short' }).format(date);
      
      return {
        dateStr: time.substring(0, 10),
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        tempMax: data.daily.tempMax[realIndex],
        tempMin: data.daily.tempMin[realIndex],
        weatherCode: data.daily.weatherCode[realIndex],
        precipProb: data.daily.precipitationProbability[realIndex],
      };
    });
  }

  return (
    <div className="surface-card" style={{ padding: '16px 24px' }}>
      <div className="flex-between" style={{ marginTop: '8px', marginBottom: '16px' }}>
        <div className="section-header" style={{ margin: 0 }}>{showHistory ? 'Senaste 7 dagarna' : '14-dygnsprognos'}</div>
        <button 
          onClick={() => {
            setShowHistory(!showHistory);
            setExpandedIndex(null);
          }}
          className="text-xs text-muted"
          style={{ textDecoration: 'underline' }}
        >
          {showHistory ? 'Visa prognos' : 'Visa historik'}
        </button>
      </div>
      <div className="flex-col">
        {daysToShow.map((day, i) => {
          const Icon = getWeatherIcon(day.weatherCode);
          const isExpanded = expandedIndex === i;
          return (
            <div key={i} className="list-item" style={{ padding: 0 }}>
              <div 
                className="flex-between" 
                style={{ padding: '12px 0', cursor: 'pointer' }}
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
              >
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
              {isExpanded && (
                <div style={{ padding: '8px 0 16px 0', borderTop: '1px solid var(--card-border)' }}>
                  <HourlyForecast data={data} targetDate={day.dateStr} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
