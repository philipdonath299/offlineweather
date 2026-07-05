import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Settings as SettingsIcon, Menu, RefreshCw, BarChart2 } from 'lucide-react';
import { useWeatherContext } from './context/WeatherContext';
import LocationSearch from './components/LocationSearch';

// Vyer
import HomeView from './views/HomeView';
import ForecastView from './views/ForecastView';
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
    { path: '/forecast', icon: CalendarDays, label: 'Prognos' },
    { path: '/details', icon: BarChart2, label: 'Detaljer' },
    { path: '/settings', icon: SettingsIcon, label: 'Inställn.' }
  ];

  return (
    <div className="app-container">
      <header className="flex-between">
        <button className="btn-icon" onClick={() => setShowSearch(!showSearch)}>
          <Menu size={24} className="text-muted" strokeWidth={1.5} />
        </button>
        
        {isOfflineData && (
          <span className="text-xs text-muted" style={{ fontWeight: 500, letterSpacing: '0.5px' }}>OFFLINE LÄGE</span>
        )}
        
        <div className="flex-center" style={{ gap: '12px' }}>
          <button className="btn-icon" onClick={refresh} disabled={loading}>
            <RefreshCw size={20} strokeWidth={1.5} className={`text-muted ${loading ? 'spin' : ''}`} />
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
          <RefreshCw size={28} strokeWidth={1.5} className="spin" />
        </div>
      )}

      {data && (
        <main>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/forecast" element={<ForecastView />} />
            <Route path="/details" element={<DetailsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="/param/:type" element={<ParameterDetailView />} />
          </Routes>
        </main>
      )}

      {/* Floating Bottom Nav */}
      <nav className="floating-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === '/details' && location.pathname.startsWith('/param/'));
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={24} strokeWidth={1.5} />
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
