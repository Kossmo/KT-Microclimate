import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, tap } from 'rxjs';

import { CacheService } from './cache.service';
import { GeocodingResult, GeocodingResponse } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);
  private readonly cache = inject(CacheService);
  private readonly BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  search(query: string): Observable<GeocodingResult[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return of([]);

    const key = `geocoding:${trimmed.toLowerCase()}`;
    const cached = this.cache.get<GeocodingResult[]>(key);
    if (cached) return of(cached);

    const params = new HttpParams()
      .set('name', trimmed)
      .set('count', '5')
      .set('language', 'en')
      .set('format', 'json');

    return this.http.get<GeocodingResponse>(this.BASE_URL, { params }).pipe(
      map(res => res.results ?? []),
      tap(results => this.cache.set(key, results, this.CACHE_TTL)),
    );
  }
}
