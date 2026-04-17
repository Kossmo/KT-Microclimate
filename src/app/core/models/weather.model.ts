import { GeoLocation } from './location.model';

export interface ForecastResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  timezone_abbreviation: string;
  daily: DailyData;
  daily_units: Record<string, string>;
  hourly: HourlyData;
  hourly_units: Record<string, string>;
}

export interface DailyData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_sum: number[];
  weather_code: number[];
  sunrise: string[];
  sunset: string[];
  wind_speed_10m_max: number[];
}

export interface HourlyData {
  time: string[];
  temperature_2m: number[];
  precipitation: number[];
  weather_code: number[];
  wind_speed_10m?: number[];
  wind_direction_10m?: number[];
  relative_humidity_2m?: number[];
  uv_index?: number[];
}

export interface Forecast {
  location: GeoLocation;
  days: DayForecast[];
  hourlyTemperatures: number[];
  hourlyTimes: string[];
  hourlyPrecipitation: number[];
  hourlyWeatherCodes: number[];
  hourlyWindSpeed: number[];
  hourlyWindDirection: number[];
}

export interface ExtendedForecast extends Forecast {
  hourlyHumidity: number[];
  hourlyUvIndex: number[];
}

export interface DayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  weatherCode: number;
  sunrise: string;
  sunset: string;
  windSpeedMax: number;
}
