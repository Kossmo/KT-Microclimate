import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { WeatherService } from '../../core/services/weather.service';
import { GeoLocation } from '../../core/models/location.model';
import { HistoricalWeather } from '../../core/models/weather.model';
import { getWmoInfo, WmoCodeInfo } from '../../core/models/wmo-codes';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { WeatherIconComponent } from '../../shared/components/weather-icon/weather-icon.component';
import { TemperatureChartComponent } from '../../shared/components/temperature-chart/temperature-chart.component';

@Component({
  selector: 'app-time-machine',
  imports: [SearchBarComponent, WeatherIconComponent, TemperatureChartComponent, DecimalPipe],
  templateUrl: './time-machine.component.html',
  styleUrl: './time-machine.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeMachineComponent {
  private readonly weatherService = inject(WeatherService);

  protected readonly selectedDate = signal('');
  protected readonly selectedLocation = signal<GeoLocation | null>(null);
  protected readonly result = signal<HistoricalWeather | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  })();

  protected readonly minDate = '1940-01-01';

  protected readonly canSearch = computed(() =>
    this.selectedDate().length > 0 && this.selectedLocation() !== null,
  );

  protected readonly weatherInfo = computed((): WmoCodeInfo | null => {
    const r = this.result();
    return r ? getWmoInfo(r.weatherCode) : null;
  });

  protected readonly formattedDate = computed(() => {
    const d = this.result()?.date;
    if (!d) return '';
    return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  protected readonly formattedSunrise = computed(() => {
    const s = this.result()?.sunrise;
    return s ? (s.split('T')[1]?.slice(0, 5) ?? '') : '';
  });

  protected readonly formattedSunset = computed(() => {
    const s = this.result()?.sunset;
    return s ? (s.split('T')[1]?.slice(0, 5) ?? '') : '';
  });

  protected onDateChange(event: Event): void {
    this.selectedDate.set((event.target as HTMLInputElement).value);
  }

  protected onLocationSelected(location: GeoLocation): void {
    this.selectedLocation.set(location);
  }

  protected search(): void {
    const loc = this.selectedLocation();
    const date = this.selectedDate();
    if (!loc || !date) return;

    this.loading.set(true);
    this.error.set(null);

    this.weatherService.getHistoricalWeather(loc.latitude, loc.longitude, date, loc.name).subscribe({
      next: data => {
        this.result.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No data available for this date and location. Try another combination.');
        this.loading.set(false);
      },
    });
  }

  protected reset(): void {
    this.result.set(null);
    this.error.set(null);
  }
}
