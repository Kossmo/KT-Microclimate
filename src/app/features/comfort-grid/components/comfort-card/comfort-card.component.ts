import { Component, ChangeDetectionStrategy, input, output, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { ComfortCity } from '../../../../core/models/comfort.model';
import { ComfortService } from '../../../../core/services/comfort.service';
import { getWmoInfo } from '../../../../core/models/wmo-codes';
import { WeatherIconComponent } from '../../../../shared/components/weather-icon/weather-icon.component';

@Component({
  selector: 'app-comfort-card',
  imports: [DecimalPipe, WeatherIconComponent],
  templateUrl: './comfort-card.component.html',
  styleUrl: './comfort-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComfortCardComponent {
  private readonly comfortService = inject(ComfortService);

  readonly city = input.required<ComfortCity>();
  readonly rank = input(0);
  readonly highlighted = input(false);
  readonly removed = output<void>();

  protected readonly scoreColor = computed(() =>
    this.comfortService.getScoreColor(this.city().score?.overall ?? 0)
  );

  protected readonly currentWeather = computed(() => {
    const fc = this.city().forecast;
    if (!fc || fc.days.length === 0) return null;
    const today = fc.days[0];
    return { ...today, wmo: getWmoInfo(today.weatherCode) };
  });

  // SVG arc for score ring (0-100 mapped to circle arc)
  protected readonly arcPath = computed(() => {
    const score = this.city().score?.overall ?? 0;
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const dashLength = (score / 100) * circumference;
    return { circumference, dashLength };
  });

  protected readonly humidity = computed(() => {
    const fc = this.city().forecast;
    if (!fc) return null;
    const idx = Math.min(12, fc.hourlyHumidity.length - 1);
    return Math.round(fc.hourlyHumidity[idx]);
  });

  protected readonly uvIndex = computed(() => {
    const fc = this.city().forecast;
    if (!fc) return null;
    const idx = Math.min(12, fc.hourlyUvIndex.length - 1);
    return Math.round(fc.hourlyUvIndex[idx] * 10) / 10;
  });
}
