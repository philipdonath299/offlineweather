import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { WeatherData, LocationSearchResult, Settings, defaultSettings } from '../types/weather';
import { fetchWeather } from '../services/api';
import { db } from '../services/db';

interface WeatherContextType {
  data: WeatherData | null;
  location: LocationSearchResult | null;
  settings: Settings;
  loading: boolean;
  error: string | null;
  isOfflineData: boolean;
  setLocation: (loc: LocationSearchResult) => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  refresh: () => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [location, setLocationState] = useState<LocationSearchResult | null>(null);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineData, setIsOfflineData] = useState<boolean>(false);

  // Ladda initialt state från databas/localStorage
  useEffect(() => {
    async function loadInitial() {
      try {
        const savedSettings = await db.getSettings();
        if (savedSettings) setSettings({ ...defaultSettings, ...savedSettings });

        const savedLocationStr = localStorage.getItem('lastLocation');
        if (savedLocationStr) {
          setLocationState(JSON.parse(savedLocationStr));
        } else if (settings.autoLocation && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords;
              const { reverseGeocode } = await import('../services/api');
              const cityName = await reverseGeocode(latitude, longitude);
              
              setLocationState({
                id: 0,
                name: cityName,
                latitude,
                longitude,
                country: '',
              });
            },
            () => {
              setLocationState({ id: 2673730, name: 'Stockholm', latitude: 59.3294, longitude: 18.0687, country: 'Sverige' });
            }
          );
        } else {
           setLocationState({ id: 2673730, name: 'Stockholm', latitude: 59.3294, longitude: 18.0687, country: 'Sverige' });
        }
      } catch (e) {
         setLocationState({ id: 2673730, name: 'Stockholm', latitude: 59.3294, longitude: 18.0687, country: 'Sverige' });
      }
    }
    loadInitial();
  }, []);

  const loadWeather = useCallback(async (loc: LocationSearchResult, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setIsOfflineData(false);

    try {
      if (!navigator.onLine && !forceRefresh) {
        throw new Error('Offline');
      }

      const weatherData = await fetchWeather(loc.latitude, loc.longitude, loc.name);
      setData(weatherData);
      await db.saveWeather(loc.latitude, loc.longitude, weatherData);
      
    } catch (err) {
      console.warn('Network fetch failed, attempting offline load', err);
      try {
        const cachedData = await db.getWeather(loc.latitude, loc.longitude);
        if (cachedData) {
          setData(cachedData);
          setIsOfflineData(true);
        } else {
          setError('Ingen internetanslutning och ingen sparad data för denna plats.');
        }
      } catch (dbErr) {
        setError('Kunde inte läsa från lokal databas.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (location) {
      loadWeather(location);
    }
  }, [location, loadWeather]);

  const setLocation = (loc: LocationSearchResult) => {
    setLocationState(loc);
    localStorage.setItem('lastLocation', JSON.stringify(loc));
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await db.saveSettings(updated);
  };

  const refresh = () => {
    if (location) loadWeather(location, true);
  };

  return (
    <WeatherContext.Provider value={{ data, location, settings, loading, error, isOfflineData, setLocation, updateSettings, refresh }}>
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeatherContext() {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }
  return context;
}
