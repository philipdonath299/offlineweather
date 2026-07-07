import { WeatherData, LocationSearchResult, AirQualityData } from '../types/weather';

const API_BASE = 'https://api.open-meteo.com/v1/forecast';
const GEO_API_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const AQI_API_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export async function fetchAirQuality(lat: number, lon: number): Promise<AirQualityData | undefined> {
  try {
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      hourly: 'pm10,pm2_5,european_aqi,carbon_monoxide,nitrogen_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen',
      timezone: 'auto',
      past_days: '7',
      forecast_days: '14',
    });
    const res = await fetch(`${AQI_API_BASE}?${params.toString()}`);
    if (!res.ok) return undefined;
    const data = await res.json();
    return {
      aqi: data.hourly.european_aqi,
      pm10: data.hourly.pm10,
      pm2_5: data.hourly.pm2_5,
      carbonMonoxide: data.hourly.carbon_monoxide,
      nitrogenDioxide: data.hourly.nitrogen_dioxide,
      ozone: data.hourly.ozone,
      alderPollen: data.hourly.alder_pollen,
      birchPollen: data.hourly.birch_pollen,
      grassPollen: data.hourly.grass_pollen,
      time: data.hourly.time,
    };
  } catch (e) {
    console.warn("Kunde inte hämta AQI", e);
    return undefined;
  }
}

export async function fetchWeather(lat: number, lon: number, name: string): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,snow_depth,soil_temperature_0cm',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,daylight_duration,sunshine_duration',
    timezone: 'auto',
    past_days: '7', // Hämta 7 dagars historik
    forecast_days: '14', // Upp till 14 dagars prognos
  });

  const [weatherRes, aqiData] = await Promise.all([
    fetch(`${API_BASE}?${params.toString()}`),
    fetchAirQuality(lat, lon)
  ]);

  if (!weatherRes.ok) {
    throw new Error('Failed to fetch weather data');
  }
  
  const data = await weatherRes.json();
  
  const currentTimeStr = data.current?.time || new Date().toISOString();
  const currentHourPrefix = currentTimeStr.substring(0, 13);
  let currentIndex = data.hourly.time.findIndex((t: string) => t.startsWith(currentHourPrefix));
  if (currentIndex === -1) currentIndex = 0;
  
  return {
    location: {
      name,
      latitude: lat,
      longitude: lon,
    },
    current: {
      temp: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      windGusts: data.current.wind_gusts_10m,
      windDirection: data.current.wind_direction_10m,
      pressure: data.current.surface_pressure,
      uvIndex: data.hourly.uv_index[currentIndex] || 0,
      visibility: data.hourly.visibility[currentIndex] || 10000,
      dewPoint: data.current.temperature_2m - ((100 - data.current.relative_humidity_2m) / 5), // Approx
      cloudCover: data.current.cloud_cover,
      precipitation: data.current.precipitation,
      isDay: data.current.is_day === 1,
      weatherCode: data.current.weather_code,
    },
    hourly: {
      time: data.hourly.time,
      temp: data.hourly.temperature_2m,
      feelsLike: data.hourly.apparent_temperature,
      precipitation: data.hourly.precipitation,
      precipitationProbability: data.hourly.precipitation_probability,
      uvIndex: data.hourly.uv_index,
      windSpeed: data.hourly.wind_speed_10m,
      windDirection: data.hourly.wind_direction_10m,
      windGusts: data.hourly.wind_gusts_10m,
      humidity: data.hourly.relative_humidity_2m,
      dewPoint: data.hourly.dew_point_2m,
      pressure: data.hourly.surface_pressure,
      cloudCover: data.hourly.cloud_cover,
      visibility: data.hourly.visibility,
      weatherCode: data.hourly.weather_code,
      snowDepth: data.hourly.snow_depth,
      soilTemperature: data.hourly.soil_temperature_0cm,
    },
    daily: {
      time: data.daily.time,
      tempMax: data.daily.temperature_2m_max,
      tempMin: data.daily.temperature_2m_min,
      precipitationSum: data.daily.precipitation_sum,
      precipitationProbability: data.daily.precipitation_probability_max,
      uvIndexMax: data.daily.uv_index_max,
      windSpeedMax: data.daily.wind_speed_10m_max,
      sunrise: data.daily.sunrise,
      sunset: data.daily.sunset,
      weatherCode: data.daily.weather_code,
      daylightDuration: data.daily.daylight_duration,
      sunshineDuration: data.daily.sunshine_duration,
    },
    airQuality: aqiData,
    lastUpdated: Date.now(),
  };
}

interface OpenMeteoLocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export async function searchLocation(query: string): Promise<LocationSearchResult[]> {
  if (!query) return [];
  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'sv',
    format: 'json'
  });
  
  const response = await fetch(`${GEO_API_BASE}?${params.toString()}`);
  if (!response.ok) return [];
  
  const data = await response.json();
  if (!data.results) return [];
  
  return data.results.map((r: OpenMeteoLocationResult) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=sv`);
    if (!res.ok) return 'Okänd plats';
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || 'Okänd plats';
  } catch (e) {
    return 'Okänd plats';
  }
}

