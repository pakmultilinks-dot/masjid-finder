import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { C } from '../theme';
import { useLocation } from '../hooks/useLocation';
import { saveUserMosque } from '../lib/storage';

export default function Suggest() {
  const router = useRouter();
  const loc = useLocation();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const ready = loc.status === 'ready';
  const lat = ready ? loc.lat : 0;
  const lon = ready ? loc.lon : 0;

  const save = async () => {
    const clean = name.trim();
    if (!clean) {
      Alert.alert('Name needed', 'Please enter the mosque name.');
      return;
    }
    if (!ready) {
      Alert.alert('No location', 'Your location is not available yet. Try again in a moment.');
      return;
    }
    setSaving(true);
    try {
      await saveUserMosque({
        src: `user-${Date.now()}`,
        lat,
        lon,
        name: clean,
        userAdded: true,
      });
      Alert.alert('Thank you', `"${clean}" was added on this device and will show in your lists.`);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      <Text style={s.title}>Suggest a mosque</Text>
      <Text style={s.sub}>
        Know a mosque that's missing? Add its name. Your current location is used
        as the pin, so please stand at the mosque when you save it.
      </Text>

      <Text style={s.label}>Mosque name</Text>
      <TextInput
        style={s.input}
        placeholder="e.g. Jamia Masjid Noor"
        placeholderTextColor={C.muted}
        value={name}
        onChangeText={setName}
      />

      <View style={s.locBox}>
        {loc.status === 'loading' && <ActivityIndicator color={C.emerald} />}
        {loc.status === 'denied' && (
          <Pressable onPress={() => Linking.openSettings()}>
            <Text style={s.linkText}>Location is off. Open settings to enable it.</Text>
          </Pressable>
        )}
        {ready && (
          <Text style={s.locText}>
            {loc.refined ? 'Using your current position.' : 'Using your last known position...'}
          </Text>
        )}
      </View>

      <Pressable style={[s.primaryBtn, saving && s.disabled]} onPress={save} disabled={saving}>
        <Text style={s.primaryBtnText}>{saving ? 'Saving...' : 'Save mosque'}</Text>
      </Pressable>

      <Text style={s.footnote}>
        Saved on this device only, marked "Added by you". It never changes the shared map data.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.ivory, padding: 20 },
  title: { fontFamily: 'Marcellus_400Regular', fontSize: 26, color: C.emeraldDark, marginTop: 8 },
  sub: { color: C.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  label: { fontWeight: '700', fontSize: 14, color: C.ink, marginTop: 20, marginBottom: 8 },
  input: {
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, borderWidth: 1, borderColor: C.line, color: C.ink,
  },
  locBox: { marginTop: 16, alignItems: 'flex-start' },
  locText: { color: C.emerald, fontSize: 13, fontWeight: '600' },
  linkText: { color: C.emerald, fontWeight: '700', fontSize: 14 },
  primaryBtn: {
    backgroundColor: C.emerald, borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginTop: 24,
  },
  disabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  footnote: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 16 },
});
