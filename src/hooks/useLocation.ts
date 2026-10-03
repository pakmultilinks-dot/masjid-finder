import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type LocState =
  | { status: 'loading' }
  | { status: 'denied' }
  | { status: 'ready'; lat: number; lon: number; refined: boolean };

export function useLocation(): LocState {
  const [state, setState] = useState<LocState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;
      if (status !== 'granted') {
        setState({ status: 'denied' });
        return;
      }
      // Fast path: show last known position immediately.
      const last = await Location.getLastKnownPositionAsync();
      if (!cancelled && last) {
        setState({
          status: 'ready',
          lat: last.coords.latitude,
          lon: last.coords.longitude,
          refined: false,
        });
      }
      // Slow path: refine with a fresh GPS fix in the background.
      try {
        const cur = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setState({
            status: 'ready',
            lat: cur.coords.latitude,
            lon: cur.coords.longitude,
            refined: true,
          });
        }
      } catch {
        if (!cancelled && state.status === 'loading') {
          setState(last
            ? { status: 'ready', lat: last.coords.latitude, lon: last.coords.longitude, refined: false }
            : { status: 'denied' });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
