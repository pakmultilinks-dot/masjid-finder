import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import * as Location from 'expo-location';
import mosquesData from '../data/mosques.json';
import {
  Mosque,
  MosqueWithDistance,
  displayName,
  formatDistance,
  nearestMosques,
} from '../lib/geo';

type Status = 'loading' | 'denied' | 'ready' | 'error';

const MOSQUES = mosquesData as Mosque[];

export default function Index() {
  const [status, setStatus] = useState<Status>('loading');
  const [nearby, setNearby] = useState<MosqueWithDistance[]>([]);
  const [query, setQuery] = useState('');
  const [total] = useState(MOSQUES.length);

  const locate = async () => {
    setStatus('loading');
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const list = nearestMosques(MOSQUES, pos.coords.latitude, pos.coords.longitude, 50);
      setNearby(list);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  useEffect(() => {
    locate();
  }, []);

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0d5c3f" />
        <Text style={styles.note}>Finding your location...</Text>
      </View>
    );
  }

  if (status === 'denied') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Location needed</Text>
        <Text style={styles.note}>
          Masjid Finder needs your location to show the nearest mosques. No location is stored or sent anywhere.
        </Text>
        <Pressable style={styles.button} onPress={locate}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Could not get location</Text>
        <Text style={styles.note}>Check that GPS is enabled and try again.</Text>
        <Pressable style={styles.button} onPress={locate}>
          <Text style={styles.buttonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const visible = query.trim()
    ? nearby.filter((m) =>
        displayName(m).toLowerCase().includes(query.trim().toLowerCase())
      )
    : nearby;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nearest mosques</Text>
      <Text style={styles.sub}>
        {total} mapped mosques in Lahore (OpenStreetMap). Sorted by true distance.
      </Text>
      <TextInput
        style={styles.search}
        placeholder="Search by name..."
        value={query}
        onChangeText={setQuery}
      />
      <FlatList
        data={visible}
        keyExtractor={(item) => item.src}
        renderItem={({ item }) => (
          <Link href={`/mosque/${encodeURIComponent(item.src)}`} asChild>
            <Pressable style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.name}>{displayName(item)}</Text>
                <Text style={styles.coords}>
                  {item.lat.toFixed(4)}, {item.lon.toFixed(4)}
                </Text>
              </View>
              <Text style={styles.distance}>{formatDistance(item.distanceKm)}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingHorizontal: 16, paddingTop: 12 },
  center: { flex: 1, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', padding: 24 },
  heading: { fontSize: 22, fontWeight: '800', color: '#0d5c3f' },
  sub: { fontSize: 13, color: '#555', marginTop: 4, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#0d5c3f', marginBottom: 8, textAlign: 'center' },
  note: { fontSize: 15, color: '#444', textAlign: 'center', marginTop: 8 },
  button: { backgroundColor: '#0d5c3f', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  coords: { fontSize: 12, color: '#888', marginTop: 2 },
  distance: { fontSize: 15, fontWeight: '700', color: '#0d5c3f' },
  search: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 8,
  },
});
