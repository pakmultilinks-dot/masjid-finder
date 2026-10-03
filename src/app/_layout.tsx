import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, SplashScreen } from 'expo-router';
import { useFonts, Marcellus_400Regular } from '@expo-google-fonts/marcellus';
import Logo from '../components/Logo';
import { C } from '../theme';

SplashScreen.preventAutoHideAsync();

function BrandSplash() {
  return (
    <View style={s.splash}>
      <Logo size={104} />
      <Text style={s.splashName}>Masjid Finder</Text>
      <Text style={s.splashTag}>Find masjid near you</Text>
      <ActivityIndicator color={C.gold} style={{ marginTop: 28 }} />
    </View>
  );
}

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({ Marcellus_400Regular });
  const [minTime, setMinTime] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMinTime(true), 1400);
    return () => clearTimeout(t);
  }, []);

  const ready = (fontsLoaded || !!fontError) && minTime;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return <BrandSplash />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: C.emeraldDark },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontFamily: 'Marcellus_400Regular' },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="mosque/[id]" options={{ title: 'Mosque' }} />
      <Stack.Screen name="suggest" options={{ title: 'Suggest a mosque' }} />
    </Stack>
  );
}

const s = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: C.emeraldDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashName: {
    fontFamily: 'Marcellus_400Regular',
    color: C.ivory,
    fontSize: 30,
    marginTop: 18,
  },
  splashTag: {
    color: C.goldSoft,
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 0.5,
  },
});
