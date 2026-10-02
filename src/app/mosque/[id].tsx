import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import mosquesData from '../../data/mosques.json';
import { Mosque, displayName, formatDistance, haversineKm } from '../../lib/geo';
import { DayPrayerTimes, prayerTimesFor } from '../../lib/prayer';

const MOSQUES = mosquesData as Mosque[];

export default function MosqueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mosque = MOSQUES.find((m) => m.src === id);
  const [distance, setDistance] = useState<number | null>(null);
  const [times, setTimes] = useState<DayPrayerTimes | null>(null);
  const [locFailed, setLocFailed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted' || !mosque) {
          setLocFailed(true);
          return;
        }
        const pos = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = pos.coords;
        setDistance(haversineKm(latitude, longitude, mosque.lat, mosque.lon));
        setTimes(prayerTimesFor(latitude, longitude));
      } catch {
        setLocFailed(true);
      }
    })();
  }, [mosque]);

  if (!mosque) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Mosque not found</Text>
      </View>
    );
  }

  const openDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`;
    Linking.openURL(url);
  };

  const rows: Array<[string, string | undefined]> = times
    ? [
        ['Fajr', times.fajr],
        ['Sunrise', times.sunrise],
        ['Dhuhr', times.dhuhr],
        ['Asr', times.asr],
        ['Maghrib', times.maghrib],
        ['Isha', times.isha],
      ]
    : [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.name}>{displayName(mosque)}</Text>
      {distance !== null && (
        <Text style={styles.distance}>{formatDistance(distance)} away</Text>
      )}
      <Text style={styles.coords}>
        {mosque.lat.toFixed(5)}, {mosque.lon.toFixed(5)}
      </Text>

      <Pressable style={styles.button} onPress={openDirections}>
        <Text style={styles.buttonText}>Get directions</Text>
      </Pressable>

      <Text style={styles.section}>Prayer times today</Text>
      {!times && !locFailed && <ActivityIndicator color="#0d5c3f" style={{ marginTop: 8 }} />}
      {locFailed && (
        <Text style={styles.disclaimer}>
          Enable location access to see your distance and today's prayer times.
        </Text>
      )}
      {rows.map(([label, value]) => (
        <View key={label} style={styles.timeRow}>
          <Text style={styles.timeLabel}>{label}</Text>
          <Text style={styles.timeValue}>{value}</Text>
        </View>
      ))}
      <Text style={styles.disclaimer}>
        Calculated for your location (University of Islamic Sciences, Karachi method).
        These are not this mosque's announced jamaat times.
      </Text>
      <Text style={styles.disclaimer}>
        Location: OpenStreetMap contributors. Not every mosque is mapped yet.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '800', color: '#0d5c3f' },
  distance: { fontSize: 16, fontWeight: '700', color: '#111', marginTop: 6 },
  coords: { fontSize: 13, color: '#888', marginTop: 4 },
  title: { fontSize: 18, fontWeight: '700' },
  button: {
    backgroundColor: '#0d5c3f',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  section: { fontSize: 18, fontWeight: '700', color: '#111', marginTop: 24, marginBottom: 8 },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeLabel: { fontSize: 16, color: '#333' },
  timeValue: { fontSize: 16, fontWeight: '600', color: '#111' },
  disclaimer: { fontSize: 12, color: '#777', marginTop: 12, lineHeight: 17 },
});
