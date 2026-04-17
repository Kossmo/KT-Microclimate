import { Injectable } from '@angular/core';

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

@Injectable({ providedIn: 'root' })
export class CacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.store.set(key, { data, expiry: Date.now() + ttl });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }
}
