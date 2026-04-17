import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimelineStateService {
  readonly selectedHourIndex = signal(0);
  readonly maxHours = signal(168); // 7*24 default, 384 for 16-day

  readonly selectedDayIndex = computed(() =>
    Math.floor(this.selectedHourIndex() / 24)
  );

  setHour(index: number): void {
    this.selectedHourIndex.set(Math.max(0, Math.min(index, this.maxHours() - 1)));
  }

  reset(): void {
    this.selectedHourIndex.set(0);
  }
}
