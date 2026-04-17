import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';

import { CacheService } from './cache.service';
import { ForecastResponse, Forecast, ExtendedForecast, DayForecast } from '../models/weather.model';
import { GeoLocation } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  getForecast(lat: number, lon: number, locationName?: string): Observable<Forecast> {
    const latStr = lat.toFixed(4);
    const lonStr = lon.toFixed(4);
    const key = `forecast:${latStr}:${lonStr}`;
    const cached = this.cache.get<Forecast>(key);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('latitude', latStr)
      .set('longitude', lonStr)
      .set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,sunrise,sunset,wind_speed_10m_max')
      .set('hourly', 'temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m')
      .set('timezone', 'auto')
      .set('forecast_days', '7');

    return this.http.get<ForecastResponse>(this.BASE_URL, { params }).pipe(
      map(res => this.transformResponse(res, lat, lon, locationName)),
      tap(forecast => this.cache.set(key, forecast)),
    );
  }

  getExtendedForecast(lat: number, lon: number, locationName?: string): Observable<ExtendedForecast> {
    const latStr = lat.toFixed(4);
    const lonStr = lon.toFixed(4);
    const key = `forecast-ext:${latStr}:${lonStr}`;
    const cached = this.cache.get<ExtendedForecast>(key);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('latitude', latStr)
      .set('longitude', lonStr)
      .set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code,sunrise,sunset,wind_speed_10m_max')
      .set('hourly', 'temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,relative_humidity_2m,uv_index')
      .set('timezone', 'auto')
      .set('forecast_days', '16');

    return this.http.get<ForecastResponse>(this.BASE_URL, { params }).pipe(
      map(res => this.transformExtendedResponse(res, lat, lon, locationName)),
      tap(forecast => this.cache.set(key, forecast)),
    );
  }

  private transformExtendedResponse(
    res: ForecastResponse,
    lat: number,
    lon: number,
    locationName?: string,
  ): ExtendedForecast {
    const base = this.transformResponse(res, lat, lon, locationName);
    return {
      ...base,
      hourlyHumidity: res.hourly.relative_humidity_2m ?? [],
      hourlyUvIndex: res.hourly.uv_index ?? [],
    };
  }

  private transformResponse(
    res: ForecastResponse,
    lat: number,
    lon: number,
    locationName?: string,
  ): Forecast {
    const location: GeoLocation = {
      latitude: lat,
      longitude: lon,
      name: locationName,
      timezone: res.timezone,
    };

    const days: DayForecast[] = res.daily.time.map((date, i) => ({
      date,
      tempMax: res.daily.temperature_2m_max[i],
      tempMin: res.daily.temperature_2m_min[i],
      precipitation: res.daily.precipitation_sum[i],
      weatherCode: res.daily.weather_code[i],
      sunrise: res.daily.sunrise[i],
      sunset: res.daily.sunset[i],
      windSpeedMax: res.daily.wind_speed_10m_max[i],
    }));

    return {
      location,
      days,
      hourlyTemperatures: res.hourly.temperature_2m,
      hourlyTimes: res.hourly.time,
      hourlyPrecipitation: res.hourly.precipitation,
      hourlyWeatherCodes: res.hourly.weather_code,
      hourlyWindSpeed: res.hourly.wind_speed_10m ?? [],
      hourlyWindDirection: res.hourly.wind_direction_10m ?? [],
    };
  }
}
