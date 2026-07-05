import { useWeatherContext } from '../context/WeatherContext';

export default function SettingsView() {
  const { settings, updateSettings } = useWeatherContext();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>
      
      <div className="surface-card" style={{ marginTop: '20px' }}>
        <div className="section-header">APPEARANCE</div>
        <div className="flex-col">
          <div className="list-item flex-between">
            <span className="font-medium text-md">Theme</span>
            <div className="input-container" style={{ padding: '8px 12px' }}>
              <select 
                value={settings.theme} 
                onChange={(e) => updateSettings({ theme: e.target.value as any })}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', outline: 'none' }}
              >
                <option value="dark">System Default (Dark)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card">
        <div className="section-header">UNITS & DEFAULTS</div>
        <div className="flex-col">
          <div className="list-item flex-between">
            <span className="font-medium text-md">Temperature</span>
            <div className="input-container" style={{ padding: '8px 12px' }}>
              <select 
                value={settings.temperatureUnit} 
                onChange={(e) => updateSettings({ temperatureUnit: e.target.value as any })}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', outline: 'none' }}
              >
                <option value="celsius">Celsius (°C)</option>
                <option value="fahrenheit">Fahrenheit (°F)</option>
              </select>
            </div>
          </div>

          <div className="list-item flex-between">
            <span className="font-medium text-md">Wind Speed</span>
            <div className="input-container" style={{ padding: '8px 12px' }}>
              <select 
                value={settings.windUnit} 
                onChange={(e) => updateSettings({ windUnit: e.target.value as any })}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', outline: 'none' }}
              >
                <option value="ms">m/s</option>
                <option value="kmh">km/h</option>
                <option value="mph">mph</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="surface-card">
        <div className="section-header">DATA & PRIVACY</div>
        <div className="flex-col">
          <div className="list-item flex-between">
            <span className="font-medium text-md">Auto Location (GPS)</span>
            <button 
              onClick={() => updateSettings({ autoLocation: !settings.autoLocation })}
              style={{ 
                width: '50px', height: '28px', borderRadius: '14px', 
                background: settings.autoLocation ? '#4CAF50' : 'var(--card-border)',
                position: 'relative', transition: 'background 0.3s'
              }}
            >
              <div style={{
                position: 'absolute', top: '2px', left: settings.autoLocation ? '24px' : '2px',
                width: '24px', height: '24px', background: '#fff', borderRadius: '50%',
                transition: 'left 0.3s'
              }} />
            </button>
          </div>
          <div className="list-item flex-col" style={{ alignItems: 'flex-start', gap: '12px' }}>
             <button 
                className="btn-secondary" 
                onClick={async () => {
                  if (confirm('Är du säker på att du vill rensa all sparad offline-data?')) {
                     // Rensa indexeddb
                     const { deleteDB } = await import('idb');
                     await deleteDB('weather-app-db');
                     window.location.reload();
                  }
                }}
             >
                Rensa Offline Cache
             </button>
          </div>
        </div>
      </div>

    </div>
  );
}
