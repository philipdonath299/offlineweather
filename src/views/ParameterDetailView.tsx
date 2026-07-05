import { useParams, useNavigate } from 'react-router-dom';
import { useWeatherContext } from '../context/WeatherContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft } from 'lucide-react';

export default function ParameterDetailView() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { data } = useWeatherContext();

  if (!data || !type) return null;

  // Förbered grafdata för de kommande 24 timmarna
  const now = new Date();
  const currentHourString = now.toISOString().substring(0, 14) + '00';
  const startIndex = data.hourly.time.findIndex(t => t >= currentHourString) || 0;
  
  const chartData = data.hourly.time.slice(startIndex, startIndex + 24).map((time, i) => {
    const idx = startIndex + i;
    return {
      time: new Date(time).getHours().toString().padStart(2, '0') + ':00',
      temp: data.hourly.temp[idx],
      feelsLike: data.hourly.feelsLike[idx],
      wind: data.hourly.windSpeed[idx],
      gusts: data.hourly.windGusts[idx],
      pressure: data.hourly.pressure[idx],
      humidity: data.hourly.humidity[idx],
      uv: data.hourly.uvIndex[idx],
      precip: data.hourly.precipitation[idx],
    };
  });

  let title = '';
  let lines: JSX.Element[] = [];

  switch (type) {
    case 'temp':
      title = 'Temperaturutveckling';
      lines = [
        <Line key="1" type="monotone" dataKey="temp" stroke="#ffffff" strokeWidth={3} dot={false} />,
        <Line key="2" type="monotone" dataKey="feelsLike" stroke="#888888" strokeWidth={2} strokeDasharray="5 5" dot={false} />
      ];
      break;
    case 'wind':
      title = 'Vind & Byar (m/s)';
      lines = [
        <Line key="1" type="monotone" dataKey="wind" stroke="#ffffff" strokeWidth={3} dot={false} />,
        <Line key="2" type="monotone" dataKey="gusts" stroke="#888888" strokeWidth={2} strokeDasharray="3 3" dot={false} />
      ];
      break;
    case 'pressure':
      title = 'Lufttryck (hPa)';
      lines = [<Line key="1" type="monotone" dataKey="pressure" stroke="#ffffff" strokeWidth={3} dot={false} />];
      break;
    case 'uv':
      title = 'UV-index Prognos';
      lines = [<Line key="1" type="monotone" dataKey="uv" stroke="#ffffff" strokeWidth={3} dot={false} />];
      break;
    case 'humidity':
      title = 'Luftfuktighet (%)';
      lines = [<Line key="1" type="monotone" dataKey="humidity" stroke="#ffffff" strokeWidth={3} dot={false} />];
      break;
    case 'precipitation':
      title = 'Nederbörd (mm)';
      lines = [<Line key="1" type="step" dataKey="precip" stroke="#ffffff" strokeWidth={3} dot={false} />];
      break;
    default:
      title = 'Detaljer';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button onClick={() => navigate(-1)} className="flex-center" style={{ gap: '8px', alignSelf: 'flex-start', marginTop: '16px' }}>
        <ArrowLeft size={20} />
        <span className="font-medium">Tillbaka</span>
      </button>

      <div className="surface-card">
        <h2 className="text-xl font-bold" style={{ marginBottom: '24px' }}>{title}</h2>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
              <XAxis dataKey="time" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121212', border: '1px solid #262626', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              {lines}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
