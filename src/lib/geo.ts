// Real mosque location data: OpenStreetMap contributors (Pakistan extract,
// amenity=place_of_worship + religion=muslim, building=mosque, name-verified
// entries) plus manually Google-Maps-verified additions.
// Cleaned 2026-10-03: junk POIs removed, 60m dedupe. Nothing invented.
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
  /** True if distanceKm is a real road/walking distance from OSRM, false if straight-line haversine */
  roadDistance?: boolean;
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

/**
 * Get real road distance and duration from OSRM (free, no API key).
 * Returns {distanceKm, durationMin} or null if the service fails.
 * Mode: 'foot' (walking), 'bike' (cycling), 'driving' (car)
 *
 * Note: the public OSRM demo server returns the same geometry for all
 * profiles, so we use its accurate road DISTANCE but compute realistic
 * durations from typical speeds per mode.
 */
export async function osrmRoute(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  mode: 'foot' | 'bike' | 'driving' = 'foot'
): Promise<{ distanceKm: number; durationMin: number } | null> {
  // Typical speeds in km/h for each mode (Lahore city conditions)
  const SPEEDS: Record<string, number> = {
    foot: 5,      // walking
    bike: 15,     // cycling
    driving: 30,  // car in city traffic
  };

  try {
    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${fromLon},${fromLat};${toLon},${toLat}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    const distanceKm = data.routes[0].distance / 1000;
    const speedKmh = SPEEDS[mode] ?? 5;
    const durationMin = (distanceKm / speedKmh) * 60;
    return { distanceKm, durationMin };
  } catch {
    return null;
  }
}

/**
 * Get real walking road distance from OSRM (free, no API key).
 * Returns distance in km, or null if the service fails.
 */
export async function osrmWalkingKm(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<number | null> {
  const result = await osrmRoute(fromLat, fromLon, toLat, toLon, 'foot');
  return result?.distanceKm ?? null;
}

/**
 * Get all three travel modes (walk, bike, car) from OSRM.
 * Returns null for modes that fail.
 */
export async function osrmAllModes(
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number
): Promise<{
  walk: { distanceKm: number; durationMin: number } | null;
  bike: { distanceKm: number; durationMin: number } | null;
  car: { distanceKm: number; durationMin: number } | null;
}> {
  const [walk, bike, car] = await Promise.all([
    osrmRoute(fromLat, fromLon, toLat, toLon, 'foot'),
    osrmRoute(fromLat, fromLon, toLat, toLon, 'bike'),
    osrmRoute(fromLat, fromLon, toLat, toLon, 'driving'),
  ]);
  return { walk, bike, car };
}

/**
 * Format a duration in minutes like Google Maps: "4 min", "1 hr 5 min"
 */
export function formatDuration(min: number): string {
  if (min < 1) return 'less than a min';
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

/**
 * Enrich a list of mosques (already sorted by haversine) with real OSRM
 * walking distances. Only the first `count` get road distances to stay fast.
 * Falls back to haversine for the rest or on failure.
 */
export async function withRoadDistances(
  mosques: MosqueWithDistance[],
  fromLat: number,
  fromLon: number,
  count: number = 10
): Promise<MosqueWithDistance[]> {
  const top = mosques.slice(0, count);
  const rest = mosques.slice(count);

  const enriched = await Promise.all(
    top.map(async (m) => {
      const roadKm = await osrmWalkingKm(fromLat, fromLon, m.lat, m.lon);
      if (roadKm !== null) {
        return { ...m, distanceKm: roadKm, roadDistance: true };
      }
      return { ...m, roadDistance: false };
    })
  );

  // Re-sort by the (possibly updated) distances
  return [...enriched, ...rest.map((m) => ({ ...m, roadDistance: false }))].sort(
    (a, b) => a.distanceKm - b.distanceKm
  );
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
