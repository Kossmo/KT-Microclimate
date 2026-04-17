import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

interface Point {
  x: number;
  y: number;
}

@Component({
  selector: 'app-temperature-chart',
  templateUrl: './temperature-chart.component.html',
  styleUrl: './temperature-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemperatureChartComponent {
  readonly temperatures = input.required<number[]>();
  readonly times = input.required<string[]>();
  readonly highlightIndex = input<number | null>(null);
  readonly hourSelected = output<number>();

  protected readonly width = 700;
  protected readonly height = 260;
  protected readonly padding = 44;

  protected readonly viewBox = `0 0 ${this.width} ${this.height}`;

  protected readonly tempRange = computed(() => {
    const temps = this.temperatures();
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    return { min, max, range: max - min || 1 };
  });

  protected readonly points = computed<Point[]>(() => {
    const temps = this.temperatures();
    const { min, range } = this.tempRange();
    const usableW = this.width - 2 * this.padding;
    const usableH = this.height - 2 * this.padding;
    const xStep = usableW / (temps.length - 1);

    return temps.map((t, i) => ({
      x: this.padding + i * xStep,
      y: this.padding + (1 - (t - min) / range) * usableH,
    }));
  });

  // Catmull-Rom to cubic Bézier conversion for smooth curves
  protected readonly linePath = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return '';

    const tension = 0.3;
    let d = `M ${pts[0].x} ${pts[0].y}`;

    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];

      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
    }

    return d;
  });

  protected readonly areaPath = computed(() => {
    const pts = this.points();
    if (pts.length === 0) return '';
    const line = this.linePath();
    const bottom = this.height - this.padding;
    const last = pts[pts.length - 1];
    const first = pts[0];
    return `${line} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  });

  protected readonly dayLabels = computed(() => {
    const t = this.times();
    const labels: { x: number; label: string }[] = [];
    const usableW = this.width - 2 * this.padding;
    const step = usableW / (t.length - 1);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < t.length; i += 24) {
      const date = new Date(t[i]);
      labels.push({
        x: this.padding + i * step,
        label: days[date.getDay()],
      });
    }
    return labels;
  });

  protected readonly yLabels = computed(() => {
    const { min, max } = this.tempRange();
    const mid = Math.round((min + max) / 2);
    const usableH = this.height - 2 * this.padding;
    return [
      { y: this.padding, label: `${Math.round(max)}°` },
      { y: this.padding + usableH / 2, label: `${mid}°` },
      { y: this.height - this.padding, label: `${Math.round(min)}°` },
    ];
  });

  protected readonly highlightPoint = computed(() => {
    const idx = this.highlightIndex();
    if (idx === null) return null;
    const pts = this.points();
    if (idx >= pts.length) return null;
    const temps = this.temperatures();
    return { x: pts[idx].x, y: pts[idx].y, temp: Math.round(temps[idx]) };
  });

  onChartClick(event: MouseEvent): void {
    const svg = (event.currentTarget as SVGSVGElement);
    const rect = svg.getBoundingClientRect();
    const clickX = ((event.clientX - rect.left) / rect.width) * this.width;

    const pts = this.points();
    if (pts.length === 0) return;

    // Find closest point
    let closest = 0;
    let minDist = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const dist = Math.abs(pts[i].x - clickX);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    }
    this.hourSelected.emit(closest);
  }
}
