import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Mosque } from './geo';

const KEY = 'masjidfinder.userMosques.v1';

export async function loadUserMosques(): Promise<Mosque[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function saveUserMosque(m: Mosque): Promise<void> {
  const cur = await loadUserMosques();
  cur.push(m);
  await AsyncStorage.setItem(KEY, JSON.stringify(cur));
}
