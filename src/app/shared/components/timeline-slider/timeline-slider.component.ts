import { Component, ChangeDetectionStrategy, input, inject, computed } from '@angular/core';

import { TimelineStateService } from '../../../core/services/timeline-state.service';

@Component({
  selector: 'app-timeline-slider',
  templateUrl: './timeline-slider.component.html',
  styleUrl: './timeline-slider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineSliderComponent {
  protected readonly timeline = inject(TimelineStateService);

  readonly times = input.required<string[]>();

  protected readonly maxIndex = computed(() => Math.max(0, this.times().length - 1));

  protected readonly dayMarkers = computed(() => {
    const t = this.times();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const markers: { position: number; label: string }[] = [];
    for (let i = 0; i < t.length; i += 24) {
      const date = new Date(t[i]);
      markers.push({
        position: (i / Math.max(1, t.length - 1)) * 100,
        label: days[date.getDay()],
      });
    }
    return markers;
  });

  protected readonly currentLabel = computed(() => {
    const t = this.times();
    const idx = this.timeline.selectedHourIndex();
    if (idx >= t.length) return '';
    const date = new Date(t[idx]);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = date.getHours().toString().padStart(2, '0');
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${hours}:00`;
  });

  protected readonly thumbPosition = computed(() => {
    const max = this.maxIndex();
    if (max === 0) return 0;
    return (this.timeline.selectedHourIndex() / max) * 100;
  });

  onInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.timeline.setHour(value);
  }
}
