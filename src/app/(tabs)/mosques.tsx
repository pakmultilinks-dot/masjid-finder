import { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, Pressable, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../../theme';
import { useLocation } from '../../hooks/useLocation';
import { useNearest, useMosques } from '../../hooks/useMosques';
import { formatDistance, displayName, type MosqueWithDistance } from '../../lib/geo';

export default function Mosques() {
  const router = useRouter();
  const loc = useLocation();
  const mosques = useMosques();
  const [query, setQuery] = useState('');

  const lat = loc.status === 'ready' ? loc.lat : null;
  const lon = loc.status === 'ready' ? loc.lon : null;
  const sorted = useNearest(lat, lon, mosques.length);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((m) => (m.name ?? '').toLowerCase().includes(q));
  }, [sorted, query]);

  const renderItem = ({ item }: { item: MosqueWithDistance }) => (
    <Pressable style={s.card} onPress={() => router.push(`/mosque/${item.src}`)}>
      <View style={{ flex: 1 }}>
        <Text style={s.name}>{displayName(item)}</Text>
        <View style={s.metaRow}>
          <Text style={s.dist}>{formatDistance(item.distanceKm)} away</Text>
          {item.userAdded && <Text style={s.badge}>Added by you</Text>}
        </View>
      </View>
      <Text style={s.chev}>›</Text>
    </Pressable>
  );

  return (
    <View style={s.root}>
      <View style={s.top}>
        <Text style={s.title}>Mosques</Text>
        <Text style={s.sub}>{mosques.length} mapped in Lahore</Text>
        <TextInput
          style={s.search}
          placeholder="Search by name..."
          placeholderTextColor={C.muted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {loc.status === 'loading' && (
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.emerald} />
        </View>
      )}

      {loc.status === 'denied' && (
        <View style={s.center}>
          <Text style={s.muted}>Location is off. Distances can't be shown.</Text>
          <Pressable style={s.linkBtn} onPress={() => Linking.openSettings()}>
            <Text style={s.linkText}>Open settings</Text>
          </Pressable>
        </View>
      )}

      {loc.status === 'ready' && (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.src}
          renderItem={renderItem}
          contentContainerStyle={s.list}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={7}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={s.muted}>No mosque matches "{query}".</Text>
              <Text style={s.mutedSmall}>Know one that's missing? Suggest it from the Home tab.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory },
  top: { padding: 16, paddingBottom: 8 },
  title: { fontFamily: 'Marcellus_400Regular', fontSize: 28, color: C.emeraldDark },
  sub: { color: C.muted, fontSize: 13, marginTop: 2, marginBottom: 10 },
  search: {
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, borderWidth: 1, borderColor: C.line, color: C.ink,
  },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', borderWidth: 1, borderColor: C.line,
  },
  name: { fontSize: 16, fontWeight: '600', color: C.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  dist: { color: C.emerald, fontSize: 13, fontWeight: '600' },
  badge: {
    backgroundColor: C.goldSoft, color: C.emeraldDeep, fontSize: 10,
    fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  chev: { fontSize: 26, color: C.muted, marginLeft: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  muted: { color: C.muted, fontSize: 14, textAlign: 'center' },
  mutedSmall: { color: C.muted, fontSize: 12, textAlign: 'center' },
  linkBtn: { marginTop: 8 },
  linkText: { color: C.emerald, fontWeight: '700', fontSize: 14 },
});
