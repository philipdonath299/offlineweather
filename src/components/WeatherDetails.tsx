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
      title: 'Luftfuktighet',
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
      {details.map((item, i) => {
        const Icon = item.icon;
        return (
          <div key={i} className="glass-panel flex-col" style={{ gap: '12px' }}>
            <div className="flex-center text-muted" style={{ gap: '8px', justifyContent: 'flex-start' }}>
              <Icon size={16} />
              <span className="text-xs font-medium" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>
                {item.title}
              </span>
            </div>
            <span className="text-xl font-medium">{item.value}</span>
          </div>
        );
      })}
    </div>
  );
}
