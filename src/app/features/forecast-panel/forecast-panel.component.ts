import { Component, ChangeDetectionStrategy, input, output, computed, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { Forecast } from '../../core/models/weather.model';
import { getWmoInfo, WeatherIconType } from '../../core/models/wmo-codes';
import { WeatherIconComponent } from '../../shared/components/weather-icon/weather-icon.component';
import { DailyCardComponent } from './components/daily-card/daily-card.component';

export type HourlyMode = 'temp' | 'wind' | 'rain';

interface HourlyEntry {
  timeLabel: string;
  temp: number;
  precipitation: number;
  precipPercent: number;
  windSpeed: number;
  windDirection: number;
  icon: WeatherIconType;
  severity: 'light' | 'moderate' | 'heavy';
  isNight: boolean;
}

@Component({
  selector: 'app-forecast-panel',
  imports: [DecimalPipe, WeatherIconComponent, DailyCardComponent],
  templateUrl: './forecast-panel.component.html',
  styleUrl: './forecast-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForecastPanelComponent {
  readonly forecast = input.required<Forecast>();
  readonly canAddToCompare = input(false);
  readonly closed = output<void>();
  readonly addToCompare = output<void>();

  protected readonly selectedDayIdx = signal<number | null>(null);
  protected readonly hourlyMode = signal<HourlyMode>('temp');
  protected readonly dragOffset = signal(0);
  protected readonly isDragging = signal(false);

  private dragStartX = 0;
  private dragStartOffset = 0;
  private containerWidth = 0;
  private stripWidth = 0;

  protected readonly currentWeather = computed(() => {
    const fc = this.forecast();
    if (fc.days.length === 0) return null;
    const day = fc.days[0];
    const wmo = getWmoInfo(day.weatherCode);
    return { ...day, wmo, displayTemp: Math.round(day.tempMax) };
  });

  protected readonly hourlyEntries = computed<HourlyEntry[]>(() => {
    const idx = this.selectedDayIdx();
    if (idx === null) return [];
    const fc = this.forecast();
    const start = idx * 24;
    const day = fc.days[idx];
    const sunriseHour = parseInt(day.sunrise.split('T')[1]?.split(':')[0] ?? '6', 10);
    const sunsetHour = parseInt(day.sunset.split('T')[1]?.split(':')[0] ?? '20', 10);

    const entries = Array.from({ length: 24 }, (_, h) => {
      const absIdx = start + h;
      const wmo = getWmoInfo(fc.hourlyWeatherCodes[absIdx] ?? 0);
      return {
        timeLabel: `${h.toString().padStart(2, '0')}h`,
        temp: Math.round(fc.hourlyTemperatures[absIdx] ?? 0),
        precipitation: fc.hourlyPrecipitation[absIdx] ?? 0,
        precipPercent: 0,
        windSpeed: Math.round(fc.hourlyWindSpeed[absIdx] ?? 0),
        windDirection: fc.hourlyWindDirection[absIdx] ?? 0,
        icon: wmo.icon,
        severity: wmo.severity,
        isNight: h < sunriseHour || h >= sunsetHour,
      };
    });

    const maxPrecip = Math.max(1, ...entries.map(e => e.precipitation));
    entries.forEach(e => (e.precipPercent = (e.precipitation / maxPrecip) * 100));
    return entries;
  });

  protected readonly locationLabel = computed(() => {
    const loc = this.forecast().location;
    return loc.name ?? `${loc.latitude.toFixed(2)}°, ${loc.longitude.toFixed(2)}°`;
  });

  protected readonly coordinates = computed(() => {
    const loc = this.forecast().location;
    return `${loc.latitude.toFixed(4)}°N, ${loc.longitude.toFixed(4)}°E`;
  });

  selectDay(index: number): void {
    const isOpening = this.selectedDayIdx() !== index;
    this.selectedDayIdx.update(current => current === index ? null : index);
    if (isOpening) this.dragOffset.set(-8 * 80);
  }

  setMode(mode: HourlyMode): void {
    this.hourlyMode.set(mode);
  }

  onDragStart(e: PointerEvent): void {
    this.isDragging.set(true);
    this.dragStartX = e.clientX;
    this.dragStartOffset = this.dragOffset();
    const el = e.currentTarget as HTMLElement;
    this.containerWidth = el.getBoundingClientRect().width;
    const strip = el.querySelector('.cards-strip') as HTMLElement;
    this.stripWidth = strip?.offsetWidth ?? this.containerWidth * 4;
    el.setPointerCapture(e.pointerId);
  }

  onDragMove(e: PointerEvent): void {
    if (!this.isDragging()) return;
    const delta = e.clientX - this.dragStartX;
    const minOffset = Math.min(0, this.containerWidth - this.stripWidth);
    this.dragOffset.set(Math.max(minOffset, Math.min(0, this.dragStartOffset + delta)));
  }

  onDragEnd(): void {
    this.isDragging.set(false);
  }
}
