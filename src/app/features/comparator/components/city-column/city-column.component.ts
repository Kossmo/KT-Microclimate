import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { CityEntry } from '../../../../core/models/comparator.model';
import { getWmoInfo, WmoCodeInfo } from '../../../../core/models/wmo-codes';
import { DayForecast } from '../../../../core/models/weather.model';
import { WeatherIconComponent } from '../../../../shared/components/weather-icon/weather-icon.component';
import { TemperatureChartComponent } from '../../../../shared/components/temperature-chart/temperature-chart.component';

interface DaySummary extends DayForecast {
  wmo: WmoCodeInfo;
  dayLabel: string;
}

@Component({
  selector: 'app-city-column',
  imports: [
    DecimalPipe,
    WeatherIconComponent,
    TemperatureChartComponent,
  ],
  templateUrl: './city-column.component.html',
  styleUrl: './city-column.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityColumnComponent {
  readonly city = input.required<CityEntry>();
  readonly removed = output<void>();

  protected readonly currentWeather = computed(() => {
    const fc = this.city().forecast;
    if (!fc || fc.days.length === 0) return null;
    const today = fc.days[0];
    return { ...today, wmo: getWmoInfo(today.weatherCode) };
  });

  protected readonly locationLabel = computed(() => {
    const loc = this.city().location;
    return loc.name ?? `${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`;
  });

  protected readonly daysSummary = computed<DaySummary[]>(() => {
    const fc = this.city().forecast;
    if (!fc) return [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return fc.days.map(day => ({
      ...day,
      wmo: getWmoInfo(day.weatherCode),
      dayLabel: dayNames[new Date(day.date).getDay()],
    }));
  });
}
