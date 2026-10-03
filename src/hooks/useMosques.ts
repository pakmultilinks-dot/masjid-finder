import { useEffect, useMemo, useState } from 'react';
import { nearestMosques, type Mosque, type MosqueWithDistance } from '../lib/geo';
import { loadUserMosques } from '../lib/storage';
import allMosques from '../data/mosques.json';

const base = allMosques as Mosque[];

export function useMosques(): Mosque[] {
  const [user, setUser] = useState<Mosque[]>([]);
  useEffect(() => {
    loadUserMosques().then(setUser);
  }, []);
  return useMemo(() => [...base, ...user], [user]);
}

export function useNearest(lat: number | null, lon: number | null, limit = 50): MosqueWithDistance[] {
  const mosques = useMosques();
  return useMemo(() => {
    if (lat == null || lon == null) return [];
    return nearestMosques(mosques, lat, lon, limit);
  }, [mosques, lat, lon, limit]);
}
