import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#0d5c3f' },
        headerTintColor: '#ffffff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Masjid Finder' }} />
      <Stack.Screen name="mosque/[id]" options={{ title: 'Mosque details' }} />
    </Stack>
  );
}
