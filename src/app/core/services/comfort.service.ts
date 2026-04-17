import { Injectable } from '@angular/core';

import { GeoLocation } from '../models/location.model';
import { ExtendedForecast } from '../models/weather.model';
import { ComfortBreakdown } from '../models/comfort.model';

@Injectable({ providedIn: 'root' })
export class ComfortService {
  readonly predefinedCities: GeoLocation[] = [
    { latitude: 48.8566, longitude: 2.3522, name: 'Paris', country: 'France' },
    { latitude: 35.6762, longitude: 139.6503, name: 'Tokyo', country: 'Japan' },
    { latitude: 40.7128, longitude: -74.006, name: 'New York', country: 'USA' },
    { latitude: -33.8688, longitude: 151.2093, name: 'Sydney', country: 'Australia' },
    { latitude: -22.9068, longitude: -43.1729, name: 'Rio de Janeiro', country: 'Brazil' },
    { latitude: 25.2048, longitude: 55.2708, name: 'Dubai', country: 'UAE' },
    { latitude: 13.7563, longitude: 100.5018, name: 'Bangkok', country: 'Thailand' },
    { latitude: 51.5074, longitude: -0.1278, name: 'London', country: 'UK' },
    { latitude: 41.9028, longitude: 12.4964, name: 'Rome', country: 'Italy' },
    { latitude: 41.3874, longitude: 2.1686, name: 'Barcelona', country: 'Spain' },
    { latitude: -33.9249, longitude: 18.4241, name: 'Cape Town', country: 'South Africa' },
    { latitude: 64.1466, longitude: -21.9426, name: 'Reykjavik', country: 'Iceland' },
  ];

  calculateScore(forecast: ExtendedForecast): ComfortBreakdown {
    // Use midday values (index 12 = noon of first day)
    const idx = Math.min(12, forecast.hourlyTemperatures.length - 1);

    const temp = forecast.hourlyTemperatures[idx];
    const humidity = forecast.hourlyHumidity[idx] ?? 50;
    const wind = forecast.days[0]?.windSpeedMax ?? 0;
    const uv = forecast.hourlyUvIndex[idx] ?? 3;

    const tempScore = this.temperatureScore(temp);
    const humidityScore = this.humidityScore(humidity);
    const windScore = this.windScore(wind);
    const uvScore = this.uvScore(uv);

    const overall = Math.round(
      0.4 * tempScore + 0.25 * humidityScore + 0.2 * windScore + 0.15 * uvScore
    );

    return {
      temperature: tempScore,
      humidity: humidityScore,
      wind: windScore,
      uv: uvScore,
      overall,
    };
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#4a6b4e'; // green
    if (score >= 60) return '#7a9e7e'; // sage
    if (score >= 40) return '#d4956a'; // warm
    if (score >= 20) return '#c27040'; // orange
    return '#8b3a2a'; // red
  }

  private temperatureScore(temp: number): number {
    return Math.round(Math.max(0, Math.min(100, 100 - 4 * Math.abs(temp - 22))));
  }

  private humidityScore(humidity: number): number {
    if (humidity >= 40 && humidity <= 60) return 100;
    if (humidity < 40) return Math.round(Math.max(0, 100 - 3 * (40 - humidity)));
    return Math.round(Math.max(0, 100 - 3 * (humidity - 60)));
  }

  private windScore(wind: number): number {
    if (wind <= 15) return 100;
    if (wind >= 60) return 0;
    return Math.round(100 * (60 - wind) / 45);
  }

  private uvScore(uv: number): number {
    if (uv <= 3) return 100;
    if (uv >= 11) return 0;
    return Math.round(100 * (11 - uv) / 8);
  }
}
