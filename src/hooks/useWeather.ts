import { useState, useEffect, useCallback } from 'react';
import { WeatherData, LocationSearchResult } from '../types/weather';
import { fetchWeather } from '../services/api';
import { db } from '../services/db';

export function useWeather(location: LocationSearchResult | null) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineData, setIsOfflineData] = useState<boolean>(false);

  const loadWeather = useCallback(async (loc: LocationSearchResult, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    setIsOfflineData(false);

    try {
      // Försök hämta från nätverket först
      if (!navigator.onLine && !forceRefresh) {
        throw new Error('Offline');
      }

      const weatherData = await fetchWeather(loc.latitude, loc.longitude, loc.name);
      setData(weatherData);
      
      // Spara i databasen för framtida offline-bruk
      await db.saveWeather(loc.latitude, loc.longitude, weatherData);
      
    } catch (err) {
      console.warn('Kunde inte hämta från nätverk, försöker med offline data', err);
      // Fallback till offline data
      try {
        const cachedData = await db.getWeather(loc.latitude, loc.longitude);
        if (cachedData) {
          setData(cachedData);
          setIsOfflineData(true);
        } else {
          setError('Ingen internetanslutning och ingen sparad data för denna plats.');
        }
      } catch (dbErr) {
        setError('Ett fel uppstod vid hämtning av data.');
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

  return { data, loading, error, isOfflineData, refresh: () => location && loadWeather(location, true) };
}
