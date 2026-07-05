export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windGusts: number;
    windDirection: number;
    pressure: number;
    uvIndex: number;
    visibility: number;
    dewPoint: number;
    cloudCover: number;
    precipitation: number;
    isDay: boolean;
    weatherCode: number;
  };
  hourly: {
    time: string[];
    temp: number[];
    feelsLike: number[];
    precipitation: number[];
    precipitationProbability: number[];
    uvIndex: number[];
    windSpeed: number[];
    humidity: number[];
    weatherCode: number[];
  };
  daily: {
    time: string[];
    tempMax: number[];
    tempMin: number[];
    precipitationSum: number[];
    precipitationProbability: number[];
    uvIndexMax: number[];
    windSpeedMax: number[];
    sunrise: string[];
    sunset: string[];
    weatherCode: number[];
  };
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  lastUpdated: number;
}

export interface Settings {
  unitSystem: 'metric' | 'imperial'; // metric: C, m/s | imperial: F, mph
  timeFormat: '24h' | '12h';
  theme: 'dark' | 'light';
  autoLocation: boolean;
}

export interface LocationSearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}
