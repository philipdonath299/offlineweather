import { useState, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Settings as SettingsIcon, RefreshCw, BarChart2 } from 'lucide-react';
import { useWeatherContext } from './context/WeatherContext';
import LocationSearch from './components/LocationSearch';
import Skeleton from './components/Skeleton';
import { LocationSearchResult } from './types/weather';

// Vyer (Lazy loaded)
const HomeView = lazy(() => import('./views/HomeView'));
const ForecastView = lazy(() => import('./views/ForecastView'));
const DetailsView = lazy(() => import('./views/DetailsView'));
const SettingsView = lazy(() => import('./views/SettingsView'));
const ParameterDetailView = lazy(() => import('./views/ParameterDetailView'));
const UVDetailView = lazy(() => import('./views/UVDetailView'));

function App() {
  const { data, loading, error, isOfflineData, refresh, setLocation, settings, showSearch, setShowSearch } = useWeatherContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLocationSelect = (loc: LocationSearchResult) => {
    setLocation(loc);
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
    <div className={`app-container ${settings.highContrast ? 'high-contrast' : ''}`}>
      <header className="flex-between">
        <div /> {/* Placeholder for left side to keep flex-between alignment */}
        <div className="flex-center" style={{ gap: '12px' }}>
          {isOfflineData && (
            <span className="text-xs text-muted" style={{ fontWeight: 500, letterSpacing: '0.5px' }}>OFFLINE LÄGE</span>
          )}
          {data?.lastUpdated && (
            <span className="text-xs text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Uppdaterad {new Date(data.lastUpdated).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
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
        <main style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="surface-card flex-center flex-col" style={{ gap: '16px', padding: '32px' }}>
            <Skeleton width="120px" height="24px" />
            <Skeleton width="80px" height="64px" borderRadius="16px" />
            <Skeleton width="160px" height="20px" />
          </div>
          <div className="surface-card">
            <Skeleton width="100px" height="20px" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '12px', overflow: 'hidden' }}>
               <Skeleton width="60px" height="100px" borderRadius="24px" />
               <Skeleton width="60px" height="100px" borderRadius="24px" />
               <Skeleton width="60px" height="100px" borderRadius="24px" />
               <Skeleton width="60px" height="100px" borderRadius="24px" />
               <Skeleton width="60px" height="100px" borderRadius="24px" />
            </div>
          </div>
        </main>
      )}

      {data && (
        <main>
          <Suspense fallback={<div className="flex-center text-muted" style={{ height: '40vh' }}><RefreshCw size={28} strokeWidth={1.5} className="spin" /></div>}>
            <Routes>
              <Route path="/" element={<HomeView />} />
              <Route path="/forecast" element={<ForecastView />} />
              <Route path="/details" element={<DetailsView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/uv" element={<UVDetailView />} />
              <Route path="/param/:type" element={<ParameterDetailView />} />
            </Routes>
          </Suspense>
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
