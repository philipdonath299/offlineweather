import CurrentWeather from '../components/CurrentWeather';
import HourlyForecast from '../components/HourlyForecast';
import DailyForecast from '../components/DailyForecast';
import WeatherDetails from '../components/WeatherDetails';
import { useWeatherContext } from '../context/WeatherContext';
import { useNavigate } from 'react-router-dom';

export default function HomeView() {
  const { data } = useWeatherContext();
  const navigate = useNavigate();

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <CurrentWeather data={data} />
      
      <button 
        className="btn-primary" 
        onClick={() => {
           // Triggas ej här eftersom vi la sökningen i Headern, men bra att ha ifall vi vill.
           // Vi kan använda denna knapp för att gå till inställningar eller liknande.
           navigate('/maps');
        }}
        style={{ marginBottom: '8px' }}
      >
        Öppna Karta
      </button>
      
      <HourlyForecast data={data} />
      <WeatherDetails data={data} />
      <DailyForecast data={data} />
    </div>
  );
}
