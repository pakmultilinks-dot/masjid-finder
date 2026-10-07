import { useEffect, useState } from 'react';
import { withRoadDistances, type MosqueWithDistance } from '../lib/geo';

/**
 * Enrich mosques with real OSRM walking distances for the top N.
 * Returns the enriched list, re-sorted by road distance.
 */
export function useRoadDistances(
  mosques: MosqueWithDistance[],
  lat: number | null,
  lon: number | null,
  count: number = 10
): MosqueWithDistance[] {
  const [enriched, setEnriched] = useState<MosqueWithDistance[]>(mosques);

  useEffect(() => {
    if (lat == null || lon == null || mosques.length === 0) {
      setEnriched(mosques);
      return;
    }

    let cancelled = false;
    withRoadDistances(mosques, lat, lon, count).then((result) => {
      if (!cancelled) setEnriched(result);
    });

    return () => {
      cancelled = true;
    };
    // Only re-run when location changes significantly or mosque list changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat?.toFixed(4), lon?.toFixed(4), mosques.length]);

  return enriched;
}
