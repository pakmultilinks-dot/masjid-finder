import { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import Logo from '../../components/Logo';
import { C } from '../../theme';
import { useLocation } from '../../hooks/useLocation';
import { useMosques } from '../../hooks/useMosques';
import { haversineKm, osrmWalkingKm, formatDistance, displayName } from '../../lib/geo';
import {
  TYPICAL_JUMMAH, JUMMAH_TYPICAL_NOTE,
  loadJummahCorrections, saveJummahCorrection, jummahFor,
} from '../../lib/jummah';

export default function MosqueDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const loc = useLocation();
  const mosques = useMosques();
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [editingJummah, setEditingJummah] = useState(false);
  const [jummahInput, setJummahInput] = useState('');

  useEffect(() => {
    loadJummahCorrections().then(setCorrections);
  }, []);

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
  const [roadDist, setRoadDist] = useState<number | null>(null);

  // Fetch real walking distance for this mosque
  useEffect(() => {
    if (lat == null || lon == null || !mosque) {
      setRoadDist(null);
      return;
    }
    let cancelled = false;
    osrmWalkingKm(lat, lon, mosque.lat, mosque.lon).then((d) => {
      if (!cancelled) setRoadDist(d);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lon, mosque?.src]);

  const havDist = lat != null && lon != null && mosque ? haversineKm(lat, lon, mosque.lat, mosque.lon) : null;
  // Use road distance if available, otherwise fall back to haversine
  const dist = roadDist ?? havDist;

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

  const jummah = jummahFor(mosque.src, corrections);

  const submitJummah = async () => {
    const t = jummahInput.trim();
    if (!t) {
      Alert.alert('Enter a time', 'Please type the Jumu\u2019ah time, for example "1:15 PM".');
      return;
    }
    await saveJummahCorrection(mosque.src, t);
    setCorrections((c) => ({ ...c, [mosque.src]: t }));
    setEditingJummah(false);
    setJummahInput('');
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

      <View style={s.jummah}>
        <Text style={s.jummahLabel}>Jumu&#8217;ah (Friday prayer)</Text>
        <Text style={s.jummahTime}>{jummah.time}</Text>
        <Text style={s.jummahNote}>
          {jummah.verified
            ? 'Reported by a user who knows this mosque.'
            : JUMMAH_TYPICAL_NOTE}
        </Text>
        {!editingJummah ? (
          <Pressable style={s.jummahEdit} onPress={() => { setEditingJummah(true); setJummahInput(jummah.verified ? jummah.time : ''); }}>
            <Text style={s.jummahEditText}>Know the exact time? Report it</Text>
          </Pressable>
        ) : (
          <View style={s.jummahForm}>
            <TextInput
              style={s.jummahInput}
              placeholder="e.g. 1:15 PM"
              placeholderTextColor={C.muted}
              value={jummahInput}
              onChangeText={setJummahInput}
            />
            <View style={s.jummahFormRow}>
              <Pressable style={s.jummahSave} onPress={submitJummah}>
                <Text style={s.jummahSaveText}>Save</Text>
              </Pressable>
              <Pressable style={s.jummahCancel} onPress={() => setEditingJummah(false)}>
                <Text style={s.jummahCancelText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      <View style={s.note}>
        <Text style={s.noteTitle}>Good to know</Text>
        <Text style={s.noteText}>
          Daily jamaat times are announced by each mosque and are not listed
          here. Jumu&#8217;ah is shown above ({TYPICAL_JUMMAH} typical across
          Pakistan) until someone who knows this mosque reports its exact time.
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
  jummah: {
    backgroundColor: C.emeraldDeep, borderRadius: 16, padding: 18, marginTop: 14,
    borderWidth: 1, borderColor: C.gold, alignItems: 'center',
  },
  jummahLabel: { color: C.goldSoft, fontSize: 13, fontWeight: '600' },
  jummahTime: {
    fontFamily: 'Marcellus_400Regular', color: C.ivory, fontSize: 34, marginTop: 4,
  },
  jummahNote: { color: C.goldSoft, fontSize: 12, textAlign: 'center', marginTop: 6, lineHeight: 17 },
  jummahEdit: { marginTop: 10, paddingVertical: 6, paddingHorizontal: 12 },
  jummahEditText: { color: C.gold, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
  jummahForm: { width: '100%', marginTop: 10 },
  jummahInput: {
    backgroundColor: C.ivory, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 15, color: C.ink,
  },
  jummahFormRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  jummahSave: {
    flex: 1, backgroundColor: C.gold, borderRadius: 10, paddingVertical: 11, alignItems: 'center',
  },
  jummahSaveText: { color: C.emeraldDeep, fontWeight: '700', fontSize: 15 },
  jummahCancel: {
    flex: 1, borderWidth: 1.5, borderColor: C.goldSoft, borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  jummahCancelText: { color: C.goldSoft, fontWeight: '700', fontSize: 15 },
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
