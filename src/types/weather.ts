export interface AirQualityData {
  aqi: number[];
  pm10: number[];
  pm2_5: number[];
  time: string[];
}

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
    windDirection: number[];
    windGusts: number[];
    humidity: number[];
    dewPoint: number[];
    pressure: number[];
    cloudCover: number[];
    visibility: number[];
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
  airQuality?: AirQualityData;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  lastUpdated: number;
}

export interface Settings {
  temperatureUnit: 'celsius' | 'fahrenheit';
  windUnit: 'ms' | 'kmh' | 'mph' | 'knots';
  precipitationUnit: 'mm' | 'inch';
  timeFormat: '24h' | '12h';
  theme: 'dark'; // Låst till mörkt tema
  autoLocation: boolean;
  autoUpdate: boolean;
}

export const defaultSettings: Settings = {
  temperatureUnit: 'celsius',
  windUnit: 'ms',
  precipitationUnit: 'mm',
  timeFormat: '24h',
  theme: 'dark',
  autoLocation: true,
  autoUpdate: true,
};

export interface LocationSearchResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State/Province
}
