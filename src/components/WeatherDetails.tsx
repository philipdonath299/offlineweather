import { WeatherData } from '../types/weather';
import { Wind, Droplets, SunDim, Eye, ThermometerSun, CloudRain } from 'lucide-react';

interface WeatherDetailsProps {
  data: WeatherData;
}

export default function WeatherDetails({ data }: WeatherDetailsProps) {
  const details = [
    {
      title: 'Känns som',
      value: `${Math.round(data.current.feelsLike)}°`,
      icon: ThermometerSun,
    },
    {
      title: 'Vind',
      value: `${Math.round(data.current.windSpeed)} m/s`,
      icon: Wind,
    },
    {
      title: 'Fuktighet',
      value: `${data.current.humidity}%`,
      icon: Droplets,
    },
    {
      title: 'UV-index',
      value: data.current.uvIndex,
      icon: SunDim,
    },
    {
      title: 'Sikt',
      value: `${(data.current.visibility / 1000).toFixed(1)} km`,
      icon: Eye,
    },
    {
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
          <div key={i} className="btn-secondary flex-col" style={{ alignItems: 'center', padding: '24px 16px', gap: '12px', cursor: 'default' }}>
            <Icon size={24} strokeWidth={1.5} className="text-muted" />
            <span className="text-md font-medium text-muted">{item.title}</span>
            <span className="text-xl font-semibold">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
