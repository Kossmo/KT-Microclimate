export type WeatherIconType =
  | 'clear'
  | 'partly-cloudy'
  | 'overcast'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'freezing-rain'
  | 'snow'
  | 'thunderstorm';

export interface WmoCodeInfo {
  description: string;
  icon: WeatherIconType;
  severity: 'light' | 'moderate' | 'heavy';
  color: string;
}

const WMO_CODES: Record<number, WmoCodeInfo> = {
  0:  { description: 'Clear sky',              icon: 'clear',          severity: 'light',    color: '#d4956a' },
  1:  { description: 'Mainly clear',           icon: 'clear',          severity: 'light',    color: '#d4956a' },
  2:  { description: 'Partly cloudy',          icon: 'partly-cloudy',  severity: 'light',    color: '#a89279' },
  3:  { description: 'Overcast',               icon: 'overcast',       severity: 'moderate', color: '#7a8a7e' },
  45: { description: 'Fog',                    icon: 'fog',            severity: 'light',    color: '#9aaa9e' },
  48: { description: 'Depositing rime fog',    icon: 'fog',            severity: 'moderate', color: '#8a9a8e' },
  51: { description: 'Light drizzle',          icon: 'drizzle',        severity: 'light',    color: '#7ba7bc' },
  53: { description: 'Moderate drizzle',       icon: 'drizzle',        severity: 'moderate', color: '#6a97ac' },
  55: { description: 'Dense drizzle',          icon: 'drizzle',        severity: 'heavy',    color: '#5b8fad' },
  56: { description: 'Light freezing drizzle', icon: 'freezing-rain',  severity: 'light',    color: '#8ab0c4' },
  57: { description: 'Dense freezing drizzle', icon: 'freezing-rain',  severity: 'heavy',    color: '#6a9ab4' },
  61: { description: 'Slight rain',            icon: 'rain',           severity: 'light',    color: '#7ba7bc' },
  63: { description: 'Moderate rain',          icon: 'rain',           severity: 'moderate', color: '#5b8fad' },
  65: { description: 'Heavy rain',             icon: 'rain',           severity: 'heavy',    color: '#4a7f9d' },
  66: { description: 'Light freezing rain',    icon: 'freezing-rain',  severity: 'light',    color: '#8ab0c4' },
  67: { description: 'Heavy freezing rain',    icon: 'freezing-rain',  severity: 'heavy',    color: '#6a9ab4' },
  71: { description: 'Slight snowfall',        icon: 'snow',           severity: 'light',    color: '#b5d4e0' },
  73: { description: 'Moderate snowfall',      icon: 'snow',           severity: 'moderate', color: '#a0c4d0' },
  75: { description: 'Heavy snowfall',         icon: 'snow',           severity: 'heavy',    color: '#8ab4c0' },
  77: { description: 'Snow grains',            icon: 'snow',           severity: 'light',    color: '#c8d8e0' },
  80: { description: 'Slight rain showers',    icon: 'rain',           severity: 'light',    color: '#7ba7bc' },
  81: { description: 'Moderate rain showers',  icon: 'rain',           severity: 'moderate', color: '#5b8fad' },
  82: { description: 'Violent rain showers',   icon: 'rain',           severity: 'heavy',    color: '#4a7f9d' },
  85: { description: 'Slight snow showers',    icon: 'snow',           severity: 'light',    color: '#b5d4e0' },
  86: { description: 'Heavy snow showers',     icon: 'snow',           severity: 'heavy',    color: '#8ab4c0' },
  95: { description: 'Thunderstorm',           icon: 'thunderstorm',   severity: 'moderate', color: '#4a4a5a' },
  96: { description: 'Thunderstorm with slight hail', icon: 'thunderstorm', severity: 'heavy', color: '#3a3a4a' },
  99: { description: 'Thunderstorm with heavy hail',  icon: 'thunderstorm', severity: 'heavy', color: '#2a2a3a' },
};

const FALLBACK: WmoCodeInfo = {
  description: 'Unknown',
  icon: 'overcast',
  severity: 'light',
  color: '#7a8a7e',
};

export function getWmoInfo(code: number): WmoCodeInfo {
  return WMO_CODES[code] ?? FALLBACK;
}
