import { useState, useEffect } from 'react';
import { Settings, RefreshCw, WifiOff } from 'lucide-react';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherDetails from './components/WeatherDetails';
import LocationSearch from './components/LocationSearch';
import { useWeather } from './hooks/useWeather';
import { LocationSearchResult } from './types/weather';

function App() {
  const [location, setLocation] = useState<LocationSearchResult | null>(null);
  const { data, loading, error, isOfflineData, refresh } = useWeather(location);

  // Ladda standardplats från localStorage vid start
  useEffect(() => {
    const saved = localStorage.getItem('lastLocation');
    if (saved) {
      setLocation(JSON.parse(saved));
    } else {
      // Default till Stockholm om inget finns
      setLocation({
        id: 2673730,
        name: 'Stockholm',
        latitude: 59.3294,
        longitude: 18.0687,
        country: 'Sverige'
      });
    }
  }, []);

  const handleLocationSelect = (loc: LocationSearchResult) => {
    setLocation(loc);
    localStorage.setItem('lastLocation', JSON.stringify(loc));
  };

  return (
    <div className="app-container">
      <header className="flex-between">
        <h1 className="text-xl font-bold" style={{ letterSpacing: '-0.5px' }}>Weather.</h1>
        <div className="flex-center" style={{ gap: '16px' }}>
          {isOfflineData && (
            <div className="flex-center text-muted" style={{ gap: '4px' }}>
              <WifiOff size={16} />
              <span className="text-xs">Offline</span>
            </div>
          )}
          <button onClick={refresh} disabled={loading} className={loading ? 'text-muted' : ''}>
            <RefreshCw size={20} className={loading ? 'spin' : ''} />
          </button>
          <button>
            <Settings size={20} />
          </button>
        </div>
      </header>

      <LocationSearch onSelectLocation={handleLocationSelect} />

      {error && !data && (
        <div className="glass-panel text-center" style={{ padding: '40px 20px', color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex-center flex-col text-muted" style={{ height: '50vh', gap: '16px' }}>
          <RefreshCw size={32} className="spin" />
          <span>Laddar väderdata...</span>
        </div>
      )}

      {data && (
        <>
          <CurrentWeather data={data} />
          <HourlyForecast data={data} />
          <WeatherDetails data={data} />
          <DailyForecast data={data} />
          
          {isOfflineData && (
            <p className="text-center text-xs text-muted" style={{ marginTop: '20px' }}>
              Senast uppdaterad: {new Date(data.lastUpdated).toLocaleString('sv-SE')}
            </p>
          )}
        </>
      )}

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default App;
