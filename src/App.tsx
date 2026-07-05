import { useState, useEffect } from 'react';
import { Settings, RefreshCw, Menu } from 'lucide-react';
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
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lastLocation');
    if (saved) {
      setLocation(JSON.parse(saved));
    } else {
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
    setShowSearch(false);
  };

  return (
    <div className="app-container">
      <header className="flex-between">
        <button className="btn-icon" onClick={() => setShowSearch(!showSearch)}>
          <Menu size={20} className="text-muted" />
        </button>
        
        {isOfflineData && (
          <span className="text-xs text-muted">Offline Mode</span>
        )}
        
        <div className="flex-center" style={{ gap: '12px' }}>
          <button className="btn-icon" onClick={refresh} disabled={loading}>
            <RefreshCw size={18} className={`text-muted ${loading ? 'spin' : ''}`} />
          </button>
          <button className="btn-icon">
            <Settings size={20} className="text-muted" />
          </button>
        </div>
      </header>

      {showSearch && <LocationSearch onSelectLocation={handleLocationSelect} />}

      {error && !data && (
        <div className="surface-card text-center" style={{ color: '#ff6b6b' }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex-center flex-col text-muted" style={{ height: '40vh', gap: '16px' }}>
          <RefreshCw size={24} className="spin" />
        </div>
      )}

      {data && (
        <>
          <CurrentWeather data={data} />
          
          <button 
            className="btn-primary" 
            onClick={() => setShowSearch(!showSearch)}
            style={{ marginBottom: '16px' }}
          >
            Sök ny plats
          </button>
          
          <HourlyForecast data={data} />
          <WeatherDetails data={data} />
          <DailyForecast data={data} />
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
