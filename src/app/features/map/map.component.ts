import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  viewChild,
  signal,
  computed,
  effect,
  afterNextRender,
  OnDestroy,
  inject,
} from '@angular/core';
import { Map, Marker, LngLat } from 'maplibre-gl';

import { WeatherService } from '../../core/services/weather.service';
import { ComparatorStateService } from '../../core/services/comparator-state.service';
import { TimelineStateService } from '../../core/services/timeline-state.service';
import { Forecast } from '../../core/models/weather.model';
import { GeoLocation } from '../../core/models/location.model';
import { getWmoInfo } from '../../core/models/wmo-codes';
import { ForecastPanelComponent } from '../forecast-panel/forecast-panel.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-map',
  imports: [ForecastPanelComponent, SearchBarComponent],
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnDestroy {
  private readonly weatherService = inject(WeatherService);
  readonly comparatorState = inject(ComparatorStateService);
  readonly timeline = inject(TimelineStateService);
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');

  private map: Map | null = null;
  private marker: Marker | null = null;
  private markerElement: HTMLDivElement | null = null;

  readonly selectedLocation = signal<GeoLocation | null>(null);
  readonly forecast = signal<Forecast | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  protected readonly markerWeatherCode = computed(() => {
    const fc = this.forecast();
    if (!fc) return null;
    const idx = this.timeline.selectedHourIndex();
    if (idx >= fc.hourlyWeatherCodes.length) return null;
    return fc.hourlyWeatherCodes[idx];
  });

  constructor() {
    afterNextRender(() => this.initMap());

    // Update marker icon when timeline changes
    effect(() => {
      const code = this.markerWeatherCode();
      if (code !== null && this.markerElement) {
        this.updateMarkerIcon(code);
      }
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  onLocationSelected(location: GeoLocation): void {
    this.map?.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 8,
      duration: 1500,
    });
    this.placeMarker(new LngLat(location.longitude, location.latitude));
    this.loadForecast(location.latitude, location.longitude, location.name);
  }

  closeForecast(): void {
    this.forecast.set(null);
    this.selectedLocation.set(null);
    this.error.set(null);
    this.timeline.reset();
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
      this.markerElement = null;
    }
  }

  addToCompare(): void {
    const loc = this.selectedLocation();
    if (loc) {
      this.comparatorState.addCity(loc);
    }
  }

  private initMap(): void {
    this.map = new Map({
      container: this.mapContainer().nativeElement,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [2.35, 46.85],
      zoom: 4,
      attributionControl: false,
      dragRotate: false,
      renderWorldCopies: false,
    });

    this.map.on('click', (e) => {
      this.placeMarker(e.lngLat);
      this.loadForecast(e.lngLat.lat, e.lngLat.lng);
    });
  }

  private placeMarker(lngLat: LngLat): void {
    if (this.marker) {
      this.marker.remove();
    }

    const el = document.createElement('div');
    el.className = 'map-marker';
    el.innerHTML = this.getMarkerSvg();
    this.markerElement = el;

    this.marker = new Marker({ element: el })
      .setLngLat(lngLat)
      .addTo(this.map!);
  }

  private updateMarkerIcon(weatherCode: number): void {
    if (!this.markerElement) return;
    const info = getWmoInfo(weatherCode);
    const svg = this.markerElement.querySelector('svg');
    if (svg) {
      const circle = svg.querySelector('.marker-fill');
      if (circle) {
        circle.setAttribute('fill', info.color);
      }
    }
  }

  private getMarkerSvg(): string {
    return `<svg width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 24 14 24s14-13.5 14-24C28 6.268 21.732 0 14 0z" fill="#4a6b4e"/>
      <circle class="marker-fill" cx="14" cy="13" r="6" fill="#7a9e7e"/>
      <path d="M14 8c-1 2-3 4-3 6a3 3 0 006 0c0-2-2-4-3-6z" fill="#f5f0e8" opacity="0.8"/>
    </svg>`;
  }

  private loadForecast(lat: number, lon: number, name?: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.timeline.reset();

    this.selectedLocation.set({ latitude: lat, longitude: lon, name });

    this.weatherService.getForecast(lat, lon, name).subscribe({
      next: (forecast) => {
        this.forecast.set(forecast);
        this.timeline.maxHours.set(forecast.hourlyTimes.length);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load forecast. Please try again.');
        this.isLoading.set(false);
        console.error('Forecast error:', err);
      },
    });
  }
}
