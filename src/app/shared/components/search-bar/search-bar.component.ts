import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  input,
  output,
  OnInit,
  OnDestroy,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Subject, debounceTime, switchMap, distinctUntilChanged, Subscription, of } from 'rxjs';

import { GeocodingService } from '../../../core/services/geocoding.service';
import { GeocodingResult, GeoLocation } from '../../../core/models/location.model';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements OnInit, OnDestroy {
  private readonly geocodingService = inject(GeocodingService);
  private readonly elementRef = inject(ElementRef);
  private readonly searchSubject = new Subject<string>();
  private subscription: Subscription | null = null;

  readonly inline = input(false);
  readonly locationSelected = output<GeoLocation>();

  readonly query = signal('');
  readonly results = signal<GeocodingResult[]>([]);
  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);

  ngOnInit(): void {
    this.subscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.trim().length >= 2 ? this.geocodingService.search(q) : of([])),
    ).subscribe(results => {
      this.results.set(results);
      this.isOpen.set(results.length > 0);
      this.activeIndex.set(-1);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.set(value);
    this.searchSubject.next(value);
  }

  onKeydown(event: KeyboardEvent): void {
    const items = this.results();
    if (!this.isOpen() || items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.update(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0) {
          this.selectResult(items[this.activeIndex()]);
        }
        break;
      case 'Escape':
        this.close();
        break;
    }
  }

  selectResult(result: GeocodingResult): void {
    const location: GeoLocation = {
      latitude: result.latitude,
      longitude: result.longitude,
      name: result.name,
      country: result.country,
      timezone: result.timezone,
    };
    this.locationSelected.emit(location);
    this.query.set(result.name);
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  private close(): void {
    this.isOpen.set(false);
    this.activeIndex.set(-1);
  }
}
