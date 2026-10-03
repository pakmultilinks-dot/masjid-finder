import { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import Logo from '../../components/Logo';
import { C } from '../../theme';
import { useLocation } from '../../hooks/useLocation';
import { useNearest, useMosques } from '../../hooks/useMosques';
import {
  prayerTimesFor, nextPrayer, countdownText,
} from '../../lib/prayer';
import { formatDistance, displayName } from '../../lib/geo';

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

function dateLine(): string {
  return new Intl.DateTimeFormat('en-PK', {
    weekday: 'long', day: 'numeric', month: 'long',
  }).format(new Date());
}

export default function Home() {
  const router = useRouter();
  const loc = useLocation();
  const mosques = useMosques();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const lat = loc.status === 'ready' ? loc.lat : null;
  const lon = loc.status === 'ready' ? loc.lon : null;
  const nearest = useNearest(lat, lon, 3);

  const prayer = useMemo(
    () => (lat != null && lon != null ? nextPrayer(lat, lon, now) : null),
    [lat, lon, now],
  );
  const times = useMemo(
    () => (lat != null && lon != null ? prayerTimesFor(lat, lon, now) : null),
    [lat, lon, now],
  );

  const openDirections = (dlat: number, dlon: number) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dlat},${dlon}`);
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <View style={s.header}>
        <Logo size={52} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={s.brand}>Masjid Finder</Text>
          <Text style={s.tagline}>Find masjid near you</Text>
        </View>
        <Text style={s.date}>{dateLine()}</Text>
      </View>

      {loc.status === 'loading' && (
        <View style={s.centerBox}>
          <ActivityIndicator size="large" color={C.emerald} />
          <Text style={s.muted}>Finding your location...</Text>
        </View>
      )}

      {loc.status === 'denied' && (
        <View style={s.centerBox}>
          <Text style={s.h2}>Location is off</Text>
          <Text style={s.mutedCenter}>
            Masjid Finder needs your location to show nearby mosques and prayer times.
          </Text>
          <Pressable style={s.primaryBtn} onPress={() => Linking.openSettings()}>
            <Text style={s.primaryBtnText}>Open settings</Text>
          </Pressable>
        </View>
      )}

      {loc.status === 'ready' && prayer && times && (
        <>
          <View style={s.hero}>
            <Text style={s.heroKicker}>NEXT PRAYER</Text>
            <Text style={s.heroName}>{prayer.name}</Text>
            <Text style={s.heroCountdown}>{countdownText(prayer.at, now)}</Text>
            <Text style={s.heroTime}>{prayer.label}</Text>
            <View style={s.heroStrip}>
              {PRAYER_ORDER.map((p) => {
                const key = p.toLowerCase() as keyof typeof times;
                const active = p === prayer.name;
                return (
                  <View key={p} style={[s.stripItem, active && s.stripItemActive]}>
                    <Text style={[s.stripName, active && s.stripNameActive]}>{p.slice(0, 4)}</Text>
                    <Text style={[s.stripTime, active && s.stripTimeActive]}>{times[key]}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={s.disclaimer}>
              Calculated prayer times (Karachi method). Not a mosque's announced jamaat time.
            </Text>
          </View>

          {nearest.length > 0 && (
            <View style={s.card}>
              <Text style={s.cardKicker}>NEAREST MOSQUE</Text>
              <Text style={s.mosqueName}>{displayName(nearest[0])}</Text>
              <View style={s.row}>
                <Text style={s.distance}>{formatDistance(nearest[0].distanceKm)} away</Text>
                {nearest[0].userAdded && <Text style={s.badge}>Added by you</Text>}
              </View>
              <View style={s.btnRow}>
                <Pressable
                  style={s.primaryBtn}
                  onPress={() => router.push(`/mosque/${nearest[0].src}`)}
                >
                  <Text style={s.primaryBtnText}>Details</Text>
                </Pressable>
                <Pressable
                  style={s.ghostBtn}
                  onPress={() => openDirections(nearest[0].lat, nearest[0].lon)}
                >
                  <Text style={s.ghostBtnText}>Directions</Text>
                </Pressable>
              </View>
            </View>
          )}

          <View style={s.actions}>
            <Pressable style={s.action} onPress={() => router.push('/(tabs)/mosques')}>
              <Text style={s.actionIcon}>◈</Text>
              <Text style={s.actionLabel}>Find mosques</Text>
            </Pressable>
            <Pressable style={s.action} onPress={() => router.push('/(tabs)/prayer')}>
              <Text style={s.actionIcon}>◐</Text>
              <Text style={s.actionLabel}>Prayer times</Text>
            </Pressable>
            <Pressable style={s.action} onPress={() => router.push('/suggest')}>
              <Text style={s.actionIcon}>✚</Text>
              <Text style={s.actionLabel}>Suggest a mosque</Text>
            </Pressable>
          </View>

          <Text style={s.footnote}>
            {mosques.length} mosques mapped in Lahore. Locations by OpenStreetMap
            contributors and Google Maps verification; coverage is growing and may
            miss some mosques.
          </Text>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  content: { padding: 16, paddingBottom: 32 },
  header: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 8,
  },
  brand: { fontFamily: 'Marcellus_400Regular', fontSize: 24, color: C.emeraldDark },
  tagline: { color: C.muted, fontSize: 13, marginTop: 2 },
  date: { color: C.muted, fontSize: 11, textAlign: 'right', maxWidth: 90 },
  centerBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  muted: { color: C.muted, fontSize: 14 },
  mutedCenter: { color: C.muted, fontSize: 14, textAlign: 'center', paddingHorizontal: 24 },
  h2: { fontFamily: 'Marcellus_400Regular', fontSize: 22, color: C.ink },
  hero: {
    backgroundColor: C.emeraldDeep, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: C.gold,
  },
  heroKicker: { color: C.gold, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  heroName: { fontFamily: 'Marcellus_400Regular', color: C.ivory, fontSize: 34, marginTop: 6 },
  heroCountdown: { color: C.goldSoft, fontSize: 30, fontWeight: '700', marginTop: 4, fontVariant: ['tabular-nums'] },
  heroTime: { color: C.ivory, fontSize: 15, marginTop: 2 },
  heroStrip: { flexDirection: 'row', marginTop: 16, gap: 6 },
  stripItem: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingVertical: 8, alignItems: 'center',
  },
  stripItemActive: { backgroundColor: C.gold },
  stripName: { color: C.goldSoft, fontSize: 10, fontWeight: '700' },
  stripNameActive: { color: C.emeraldDeep },
  stripTime: { color: C.ivory, fontSize: 10, marginTop: 2 },
  stripTimeActive: { color: C.emeraldDeep, fontWeight: '700' },
  disclaimer: { color: 'rgba(247,244,236,0.6)', fontSize: 10.5, marginTop: 12, lineHeight: 15 },
  card: {
    backgroundColor: C.card, borderRadius: 20, padding: 18, marginTop: 14,
    borderWidth: 1, borderColor: C.line,
  },
  cardKicker: { color: C.emerald, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  mosqueName: { fontFamily: 'Marcellus_400Regular', fontSize: 22, color: C.ink, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  distance: { color: C.muted, fontSize: 14 },
  badge: {
    backgroundColor: C.goldSoft, color: C.emeraldDeep, fontSize: 10,
    fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  primaryBtn: {
    backgroundColor: C.emerald, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 22,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ghostBtn: {
    borderWidth: 1.5, borderColor: C.emerald, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 22,
  },
  ghostBtnText: { color: C.emerald, fontWeight: '700', fontSize: 15 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  action: {
    flex: 1, backgroundColor: C.card, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: C.line, gap: 6,
  },
  actionIcon: { fontSize: 22, color: C.emerald },
  actionLabel: { fontSize: 12, fontWeight: '600', color: C.ink, textAlign: 'center' },
  footnote: { color: C.muted, fontSize: 11, marginTop: 18, textAlign: 'center', lineHeight: 16 },
});
