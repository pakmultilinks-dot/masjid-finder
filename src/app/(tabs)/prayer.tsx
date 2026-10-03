import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Linking, Pressable } from 'react-native';
import { C } from '../../theme';
import { useLocation } from '../../hooks/useLocation';
import { prayerTimesFor, nextPrayer } from '../../lib/prayer';

const ROWS = [
  ['Fajr', 'fajr'],
  ['Sunrise', 'sunrise'],
  ['Dhuhr', 'dhuhr'],
  ['Asr', 'asr'],
  ['Maghrib', 'maghrib'],
  ['Isha', 'isha'],
] as const;

export default function Prayer() {
  const loc = useLocation();
  const lat = loc.status === 'ready' ? loc.lat : null;
  const lon = loc.status === 'ready' ? loc.lon : null;

  const times = useMemo(
    () => (lat != null && lon != null ? prayerTimesFor(lat, lon) : null),
    [lat, lon],
  );
  const next = useMemo(
    () => (lat != null && lon != null ? nextPrayer(lat, lon) : null),
    [lat, lon],
  );

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Text style={s.title}>Prayer times</Text>
      <Text style={s.sub}>Today, for your location</Text>

      {loc.status === 'loading' && <ActivityIndicator size="large" color={C.emerald} style={{ marginTop: 40 }} />}

      {loc.status === 'denied' && (
        <View style={s.center}>
          <Text style={s.muted}>Location is off. Prayer times need your location.</Text>
          <Pressable style={s.linkBtn} onPress={() => Linking.openSettings()}>
            <Text style={s.linkText}>Open settings</Text>
          </Pressable>
        </View>
      )}

      {times && next && (
        <View style={s.card}>
          {ROWS.map(([name, key]) => {
            const active = name === next.name;
            return (
              <View key={name} style={[s.row, active && s.rowActive]}>
                <Text style={[s.name, active && s.nameActive]}>{name}</Text>
                <Text style={[s.time, active && s.timeActive]}>{times[key]}</Text>
                {active && <Text style={s.nextTag}>NEXT</Text>}
              </View>
            );
          })}
        </View>
      )}

      <Text style={s.disclaimer}>
        Calculated using the University of Islamic Sciences, Karachi method for your
        location. These are not the announced jamaat times of any mosque. Always
        confirm jamaat timings with the mosque itself.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontFamily: 'Marcellus_400Regular', fontSize: 28, color: C.emeraldDark, marginTop: 8 },
  sub: { color: C.muted, fontSize: 13, marginTop: 2, marginBottom: 14 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 8,
    borderWidth: 1, borderColor: C.line,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14,
    borderRadius: 14,
  },
  rowActive: { backgroundColor: C.emerald },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: C.ink },
  nameActive: { color: '#fff' },
  time: { fontSize: 16, color: C.muted, fontVariant: ['tabular-nums'] },
  timeActive: { color: '#fff', fontWeight: '700' },
  nextTag: {
    color: C.emeraldDeep, backgroundColor: C.gold, fontSize: 10, fontWeight: '800',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginLeft: 10,
  },
  center: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  muted: { color: C.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  linkBtn: { marginTop: 6 },
  linkText: { color: C.emerald, fontWeight: '700', fontSize: 14 },
  disclaimer: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 16 },
});
