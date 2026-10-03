import AsyncStorage from '@react-native-async-storage/async-storage';

// Jumu'ah (Friday congregational prayer) time.
//
// Honest-data policy: there is no public database of per-mosque Jumu'ah times
// in Pakistan, and Google Maps does not publish them. The standard time across
// Pakistan is 1:30 PM (khutbah usually starts ~1:00-1:15 PM). Every mosque
// shows this TYPICAL time, clearly labeled as unconfirmed, until a user who
// actually knows the mosque reports the exact time. We never invent a
// per-mosque time.

export const TYPICAL_JUMMAH = '1:30 PM';
export const JUMMAH_TYPICAL_NOTE =
  'Typical Jumu\u2019ah time across Pakistan. Please confirm with the mosque.';

const KEY = '@masjidfinder/jummah-corrections-v1';

export async function loadJummahCorrections(): Promise<Record<string, string>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveJummahCorrection(src: string, time: string): Promise<void> {
  const cur = await loadJummahCorrections();
  cur[src] = time.trim();
  await AsyncStorage.setItem(KEY, JSON.stringify(cur));
}

export function jummahFor(src: string, corrections: Record<string, string>): {
  time: string;
  verified: boolean;
} {
  const t = corrections[src];
  if (t) return { time: t, verified: true };
  return { time: TYPICAL_JUMMAH, verified: false };
}

export function isFriday(d = new Date()): boolean {
  return d.getDay() === 5;
}
