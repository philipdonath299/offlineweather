import { WeatherData } from '../types/weather';
import { Wind, Droplets, SunDim, Eye, ThermometerSun, CloudRain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface WeatherDetailsProps {
  data: WeatherData;
}

export default function WeatherDetails({ data }: WeatherDetailsProps) {
  const navigate = useNavigate();
  
  const details = [
    {
      id: 'temp',
      title: 'Känns som',
      value: `${Math.round(data.current.feelsLike)}°`,
      icon: ThermometerSun,
    },
    {
      id: 'wind',
      title: 'Vind',
      value: `${Math.round(data.current.windSpeed)} m/s`,
      icon: Wind,
    },
    {
      id: 'humidity',
      title: 'Fuktighet',
      value: `${data.current.humidity}%`,
      icon: Droplets,
    },
    {
      id: 'uv',
      title: 'UV-index',
      value: data.current.uvIndex,
      icon: SunDim,
    },
    {
      id: 'visibility',
      title: 'Sikt',
      value: `${(data.current.visibility / 1000).toFixed(1)} km`,
      icon: Eye,
    },
    {
      id: 'precipitation',
      title: 'Nederbörd',
      value: `${data.current.precipitation} mm`,
      icon: CloudRain,
    },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
      {details.map((item, i) => {
        const Icon = item.icon;
        return (
          <button 
            key={i} 
            className="btn-secondary flex-col" 
            style={{ alignItems: 'center', padding: '24px 16px', gap: '12px' }}
            onClick={() => navigate(`/param/${item.id}`)}
          >
            <Icon size={24} strokeWidth={1.5} className="text-muted" />
            <span className="text-md font-medium text-muted">{item.title}</span>
            <span className="text-xl font-semibold">{item.value}</span>
          </button>
        );
      })}
    </div>
  );
}
