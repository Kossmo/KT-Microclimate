import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { DayForecast } from '../../../../core/models/weather.model';
import { getWmoInfo } from '../../../../core/models/wmo-codes';
import { WeatherIconComponent } from '../../../../shared/components/weather-icon/weather-icon.component';

@Component({
  selector: 'app-daily-card',
  imports: [DecimalPipe, WeatherIconComponent],
  templateUrl: './daily-card.component.html',
  styleUrl: './daily-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyCardComponent {
  readonly day = input.required<DayForecast>();
  readonly highlighted = input(false);
  readonly clicked = output<void>();

  protected readonly wmoInfo = computed(() => getWmoInfo(this.day().weatherCode));

  protected readonly dayName = computed(() => {
    const date = new Date(this.day().date);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  });

  protected readonly dateLabel = computed(() => {
    const date = new Date(this.day().date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  });
}
