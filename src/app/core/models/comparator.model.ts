import { GeoLocation } from './location.model';
import { Forecast } from './weather.model';

export interface CityEntry {
  id: string; // "lat:lon" for dedup
  location: GeoLocation;
  forecast: Forecast | null;
  isLoading: boolean;
  error: string | null;
}
