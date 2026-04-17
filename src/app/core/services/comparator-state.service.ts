import { Injectable, inject, signal, computed } from '@angular/core';

import { WeatherService } from './weather.service';
import { GeoLocation } from '../models/location.model';
import { CityEntry } from '../models/comparator.model';

@Injectable({ providedIn: 'root' })
export class ComparatorStateService {
  private readonly weatherService = inject(WeatherService);

  readonly cities = signal<CityEntry[]>([]);
  readonly cityCount = computed(() => this.cities().length);
  readonly canAdd = computed(() => this.cities().length < 6);

  addCity(location: GeoLocation): void {
    const id = `${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;
    if (this.cities().some(c => c.id === id)) return;
    if (!this.canAdd()) return;

    const entry: CityEntry = {
      id,
      location,
      forecast: null,
      isLoading: true,
      error: null,
    };

    this.cities.update(cities => [...cities, entry]);

    this.weatherService.getForecast(location.latitude, location.longitude, location.name).subscribe({
      next: (forecast) => {
        this.cities.update(cities =>
          cities.map(c => c.id === id ? { ...c, forecast, isLoading: false } : c)
        );
      },
      error: () => {
        this.cities.update(cities =>
          cities.map(c => c.id === id ? { ...c, isLoading: false, error: 'Failed to load' } : c)
        );
      },
    });
  }

  removeCity(id: string): void {
    this.cities.update(cities => cities.filter(c => c.id !== id));
  }

  clearAll(): void {
    this.cities.set([]);
  }
}
