import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Logo from '../../components/Logo';
import { C } from '../../theme';
import { useLocation } from '../../hooks/useLocation';
import { useMosques } from '../../hooks/useMosques';
import { haversineKm, formatDistance, displayName } from '../../lib/geo';

export default function MosqueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loc = useLocation();
  const mosques = useMosques();

  const mosque = useMemo(() => mosques.find((m) => m.src === id) ?? null, [mosques, id]);

  if (!mosque) {
    return (
      <View style={s.center}>
        <Text style={s.muted}>Mosque not found.</Text>
      </View>
    );
  }

  const lat = loc.status === 'ready' ? loc.lat : null;
  const lon = loc.status === 'ready' ? loc.lon : null;
  const dist = lat != null && lon != null ? haversineKm(lat, lon, mosque.lat, mosque.lon) : null;

  const openDirections = () => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`);
  };

  const report = async () => {
    const text = `Correction for mosque in Masjid Finder:\nName: ${displayName(mosque)}\nLocation: ${mosque.lat}, ${mosque.lon}\nIssue: `;
    await Clipboard.setStringAsync(text);
    Alert.alert(
      'Details copied',
      'A correction template was copied. Paste it anywhere with the details of what is wrong.',
    );
  };

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <View style={s.hero}>
        <Logo size={64} />
        <Text style={s.name}>{displayName(mosque)}</Text>
        <View style={s.metaRow}>
          {dist != null && <Text style={s.dist}>{formatDistance(dist)} away</Text>}
          {mosque.userAdded && <Text style={s.badge}>Added by you</Text>}
        </View>
      </View>

      <Pressable style={s.primaryBtn} onPress={openDirections}>
        <Text style={s.primaryBtnText}>Get directions</Text>
      </Pressable>

      <View style={s.note}>
        <Text style={s.noteTitle}>Good to know</Text>
        <Text style={s.noteText}>
          Jamaat and Jumu'ah times are announced by each mosque and are not listed
          here. Please confirm prayer timings with the mosque directly.
        </Text>
        <Text style={s.noteText}>
          Location from OpenStreetMap contributors. If this pin is wrong or this is
          not a mosque, you can report it below.
        </Text>
        {!mosque.name && mosque.area && (
          <Text style={s.noteText}>
            This mosque has no mapped name yet, so it is shown by its area
            ({mosque.area}). If you know its real name, please suggest it from the
            Home tab so every mosque is named properly.
          </Text>
        )}
      </View>

      <Pressable style={s.ghostBtn} onPress={report}>
        <Text style={s.ghostBtnText}>Report wrong info</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.ivory },
  muted: { color: C.muted, fontSize: 14 },
  hero: {
    backgroundColor: C.emeraldDeep, borderRadius: 20, padding: 22, alignItems: 'center',
    borderWidth: 1, borderColor: C.gold,
  },
  name: {
    fontFamily: 'Marcellus_400Regular', color: C.ivory, fontSize: 24,
    textAlign: 'center', marginTop: 12,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  dist: { color: C.goldSoft, fontSize: 14 },
  badge: {
    backgroundColor: C.gold, color: C.emeraldDeep, fontSize: 10, fontWeight: '800',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  primaryBtn: {
    backgroundColor: C.emerald, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 14,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  note: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 14,
    borderWidth: 1, borderColor: C.line,
  },
  noteTitle: { fontWeight: '700', fontSize: 15, color: C.ink, marginBottom: 8 },
  noteText: { color: C.muted, fontSize: 13.5, lineHeight: 20, marginBottom: 8 },
  ghostBtn: {
    borderWidth: 1.5, borderColor: C.emerald, borderRadius: 14,
    paddingVertical: 13, alignItems: 'center', marginTop: 14,
  },
  ghostBtnText: { color: C.emerald, fontWeight: '700', fontSize: 15 },
});
