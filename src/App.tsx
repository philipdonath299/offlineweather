import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, Wind, Settings as SettingsIcon, Menu, RefreshCw } from 'lucide-react';
import { useWeatherContext } from './context/WeatherContext';
import LocationSearch from './components/LocationSearch';

// Vyer
import HomeView from './views/HomeView';
import MapsView from './views/MapsView';
import DetailsView from './views/DetailsView';
import SettingsView from './views/SettingsView';
import ParameterDetailView from './views/ParameterDetailView';

function App() {
  const { data, loading, error, isOfflineData, refresh } = useWeatherContext();
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLocationSelect = () => {
    setShowSearch(false);
    navigate('/');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Hem' },
    { path: '/maps', icon: MapIcon, label: 'Karta' },
    { path: '/details', icon: Wind, label: 'Detaljer' },
    { path: '/settings', icon: SettingsIcon, label: 'Inställn.' }
  ];

  return (
    <div className="app-container" style={{ paddingBottom: '80px' }}>
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
        </div>
      </header>

      {showSearch && <LocationSearch onSelectLocation={handleLocationSelect} />}

      {error && !data && (
        <div className="surface-card text-center" style={{ color: '#ff6b6b', margin: '20px 0' }}>
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex-center flex-col text-muted" style={{ height: '40vh', gap: '16px' }}>
          <RefreshCw size={24} className="spin" />
        </div>
      )}

      {data && (
        <main>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/maps" element={<MapsView />} />
            <Route path="/details" element={<DetailsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/param/:type" element={<ParameterDetailView />} />
          </Routes>
        </main>
      )}

      {/* Bottom Tab Bar */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--card-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0 24px 0',
        zIndex: 100,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex-col flex-center"
              style={{ gap: '4px', width: '60px', opacity: isActive ? 1 : 0.5 }}
            >
              <Icon size={24} />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </nav>

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
