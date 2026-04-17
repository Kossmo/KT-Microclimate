import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

interface Bar {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  label: string;
  opacity: number;
  dayIndex: number;
}

@Component({
  selector: 'app-precipitation-chart',
  templateUrl: './precipitation-chart.component.html',
  styleUrl: './precipitation-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrecipitationChartComponent {
  readonly precipitation = input.required<number[]>();
  readonly times = input.required<string[]>();
  readonly highlightIndex = input<number | null>(null);
  readonly daySelected = output<number>();

  protected readonly width = 700;
  protected readonly height = 180;
  protected readonly padding = 44;

  protected readonly viewBox = `0 0 ${this.width} ${this.height}`;

  protected readonly highlightDayIndex = computed(() => {
    const idx = this.highlightIndex();
    if (idx === null) return null;
    return Math.floor(idx / 24);
  });

  protected readonly dailySums = computed(() => {
    const precip = this.precipitation();
    const t = this.times();
    const sums: { value: number; label: string }[] = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < precip.length; i += 24) {
      const daySlice = precip.slice(i, i + 24);
      const sum = daySlice.reduce((a, b) => a + b, 0);
      const date = new Date(t[i]);
      sums.push({ value: Math.round(sum * 10) / 10, label: days[date.getDay()] });
    }
    return sums;
  });

  protected readonly bars = computed<Bar[]>(() => {
    const sums = this.dailySums();
    const maxVal = Math.max(...sums.map(s => s.value), 1);
    const usableW = this.width - 2 * this.padding;
    const usableH = this.height - 2 * this.padding;
    const barWidth = usableW / sums.length * 0.6;
    const gap = usableW / sums.length;

    return sums.map((s, i) => {
      const barHeight = (s.value / maxVal) * usableH;
      return {
        x: this.padding + i * gap + (gap - barWidth) / 2,
        y: this.height - this.padding - barHeight,
        width: barWidth,
        height: Math.max(barHeight, s.value > 0 ? 2 : 0),
        value: s.value,
        label: s.label,
        opacity: 0.4 + (s.value / maxVal) * 0.6,
        dayIndex: i,
      };
    });
  });

  protected readonly maxLabel = computed(() => {
    const sums = this.dailySums();
    const max = Math.max(...sums.map(s => s.value));
    return max > 0 ? `${Math.ceil(max)} mm` : '';
  });

  onBarClick(dayIndex: number): void {
    // Emit the midday hour of the clicked day
    this.daySelected.emit(dayIndex * 24 + 12);
  }
}
