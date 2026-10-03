// Real mosque location data: OpenStreetMap contributors
// (amenity=place_of_worship + religion=muslim, building=mosque, and name-verified entries).
// Collected and cleaned 2026-10-03 for Lahore. 466 mapped mosques, 396 named.
// Coverage note: OSM does not map every mosque. Only real mapped data is shipped, nothing invented.
export interface Mosque {
  src: string;
  lat: number;
  lon: number;
  name: string | null;
  // Real locality from reverse-geocoding, used only when the mapper gave no name.
  area?: string | null;
  userAdded?: boolean;
}

export interface MosqueWithDistance extends Mosque {
  distanceKm: number;
}

const R_KM = 6371.0;

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dp = ((lat2 - lat1) * Math.PI) / 180;
  const dl = ((lon2 - lon1) * Math.PI) / 180;
  const h =
    Math.sin(dp / 2) * Math.sin(dp / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
  return 2 * R_KM * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) {
    const m = Math.round(km * 1000);
    return `${m} m`;
  }
  return `${km.toFixed(1)} km`;
}

export function nearestMosques(
  mosques: Mosque[],
  lat: number,
  lon: number,
  limit: number = 50
): MosqueWithDistance[] {
  return mosques
    .map((m) => ({ ...m, distanceKm: haversineKm(lat, lon, m.lat, m.lon) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export function displayName(m: Mosque): string {
  if (m.name) return m.name;
  if (m.area) return `Mosque near ${m.area}`;
  return 'Unnamed mosque';
}

export function searchableText(m: Mosque): string {
  return `${m.name ?? ''} ${m.area ?? ''}`.toLowerCase();
}
