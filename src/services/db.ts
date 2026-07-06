import { openDB, DBSchema } from 'idb';
import { WeatherData, Settings, LocationSearchResult } from '../types/weather';

interface WeatherDB extends DBSchema {
  weather: {
    key: string;
    value: WeatherData;
  };
  settings: {
    key: string;
    value: Settings;
  };
  locations: {
    key: string;
    value: LocationSearchResult[];
  };
  recent_searches: {
    key: string;
    value: LocationSearchResult[];
  };
}

const dbPromise = openDB<WeatherDB>('weather-app-db', 2, {
  upgrade(db, oldVersion) {
    if (oldVersion < 1) {
      db.createObjectStore('weather');
      db.createObjectStore('settings');
      db.createObjectStore('locations');
    }
    if (oldVersion < 2) {
      db.createObjectStore('recent_searches');
    }
  },
});

export const db = {
  async getWeather(lat: number, lon: number): Promise<WeatherData | undefined> {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    return (await dbPromise).get('weather', key);
  },
  async saveWeather(lat: number, lon: number, data: WeatherData) {
    const key = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    await (await dbPromise).put('weather', data, key);
  },
  async getSettings(): Promise<Settings | undefined> {
    return (await dbPromise).get('settings', 'user-settings');
  },
  async saveSettings(settings: Settings) {
    await (await dbPromise).put('settings', settings, 'user-settings');
  },
  async getSavedLocations(): Promise<LocationSearchResult[]> {
    const locations = await (await dbPromise).get('locations', 'saved-locations');
    return locations || [];
  },
  async saveLocations(locations: LocationSearchResult[]) {
    await (await dbPromise).put('locations', locations, 'saved-locations');
  },
  async getRecentSearches(): Promise<LocationSearchResult[]> {
    const searches = await (await dbPromise).get('recent_searches', 'history');
    return searches || [];
  },
  async saveRecentSearches(searches: LocationSearchResult[]) {
    await (await dbPromise).put('recent_searches', searches, 'history');
  }
};
