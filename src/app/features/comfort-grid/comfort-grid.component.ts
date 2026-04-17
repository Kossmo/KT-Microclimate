import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { mergeMap, from, toArray } from 'rxjs';

import { WeatherService } from '../../core/services/weather.service';
import { ComfortService } from '../../core/services/comfort.service';
import { GeoLocation } from '../../core/models/location.model';
import { ComfortCity } from '../../core/models/comfort.model';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { ComfortCardComponent } from './components/comfort-card/comfort-card.component';

@Component({
  selector: 'app-comfort-grid',
  imports: [SearchBarComponent, ComfortCardComponent],
  templateUrl: './comfort-grid.component.html',
  styleUrl: './comfort-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComfortGridComponent implements OnInit {
  private readonly weatherService = inject(WeatherService);
  private readonly comfortService = inject(ComfortService);

  readonly cities = signal<ComfortCity[]>([]);
  readonly isInitialLoading = signal(true);
  readonly highlightedKey = signal<string | null>(null);

  ngOnInit(): void {
    this.loadPredefinedCities();
  }

  addCity(location: GeoLocation): void {
    const id = `${location.latitude.toFixed(4)}:${location.longitude.toFixed(4)}`;
    if (this.cities().some(c =>
      c.location.latitude.toFixed(4) === location.latitude.toFixed(4) &&
      c.location.longitude.toFixed(4) === location.longitude.toFixed(4)
    )) return;

    const entry: ComfortCity = {
      location,
      forecast: null,
      score: null,
      isLoading: true,
      error: null,
    };
    this.cities.update(list => [...list, entry]);

    this.weatherService.getExtendedForecast(location.latitude, location.longitude, location.name).subscribe({
      next: (forecast) => {
        const score = this.comfortService.calculateScore(forecast);
        this.cities.update(list =>
          this.sortByScore(list.map(c =>
            c.location === location ? { ...c, forecast, score, isLoading: false } : c
          ))
        );
        this.highlightedKey.set(id);
      },
      error: () => {
        this.cities.update(list =>
          list.map(c =>
            c.location === location ? { ...c, isLoading: false, error: 'Failed' } : c
          )
        );
      },
    });
  }

  removeCity(location: GeoLocation): void {
    this.cities.update(list =>
      list.filter(c =>
        c.location.latitude.toFixed(4) !== location.latitude.toFixed(4) ||
        c.location.longitude.toFixed(4) !== location.longitude.toFixed(4)
      )
    );
  }

  private loadPredefinedCities(): void {
    const locations = this.comfortService.predefinedCities;

    // Initialize all cities as loading
    this.cities.set(locations.map(loc => ({
      location: loc,
      forecast: null,
      score: null,
      isLoading: true,
      error: null,
    })));

    // Load in batches of 5 concurrent requests
    from(locations).pipe(
      mergeMap(loc =>
        this.weatherService.getExtendedForecast(loc.latitude, loc.longitude, loc.name).pipe(
          mergeMap(forecast => {
            const score = this.comfortService.calculateScore(forecast);
            return [{ location: loc, forecast, score }];
          }),
        ),
        5, // concurrency limit
      ),
      toArray(),
    ).subscribe({
      next: (results) => {
        this.cities.update(list => {
          const updated = list.map(city => {
            const result = results.find(r =>
              r.location.latitude === city.location.latitude &&
              r.location.longitude === city.location.longitude
            );
            if (result) {
              return { ...city, forecast: result.forecast, score: result.score, isLoading: false };
            }
            return { ...city, isLoading: false, error: 'Failed' };
          });
          return this.sortByScore(updated);
        });
        this.isInitialLoading.set(false);
      },
      error: () => {
        this.cities.update(list =>
          list.map(c => ({ ...c, isLoading: false, error: 'Failed' }))
        );
        this.isInitialLoading.set(false);
      },
    });
  }

  isHighlighted(city: ComfortCity): boolean {
    const key = `${city.location.latitude.toFixed(4)}:${city.location.longitude.toFixed(4)}`;
    return key === this.highlightedKey();
  }

  private sortByScore(cities: ComfortCity[]): ComfortCity[] {
    return [...cities].sort((a, b) => (b.score?.overall ?? -1) - (a.score?.overall ?? -1));
  }
}
