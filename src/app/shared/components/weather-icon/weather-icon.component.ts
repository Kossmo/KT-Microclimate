import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { WeatherIconType } from '../../../core/models/wmo-codes';

@Component({
  selector: 'app-weather-icon',
  templateUrl: './weather-icon.component.html',
  styleUrl: './weather-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherIconComponent {
  readonly type = input.required<WeatherIconType>();
  readonly severity = input<'light' | 'moderate' | 'heavy'>('light');
  readonly size = input(48);
  readonly isNight = input(false);

  protected readonly description = computed(() => {
    const night = this.isNight();
    const labels: Record<WeatherIconType, string> = {
      'clear': night ? 'Clear night' : 'Clear sky',
      'partly-cloudy': night ? 'Partly cloudy night' : 'Partly cloudy',
      'overcast': 'Overcast',
      'fog': 'Fog',
      'drizzle': 'Drizzle',
      'rain': 'Rain',
      'freezing-rain': 'Freezing rain',
      'snow': 'Snow',
      'thunderstorm': 'Thunderstorm',
    };
    return labels[this.type()];
  });
}
