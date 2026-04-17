import { GeoLocation } from './location.model';
import { ExtendedForecast } from './weather.model';

export interface ComfortCity {
  location: GeoLocation;
  forecast: ExtendedForecast | null;
  score: ComfortBreakdown | null;
  isLoading: boolean;
  error: string | null;
}

export interface ComfortBreakdown {
  temperature: number;
  humidity: number;
  wind: number;
  uv: number;
  overall: number;
}
