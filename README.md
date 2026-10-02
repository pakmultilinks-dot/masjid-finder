# Masjid Finder

Find the nearest mosque from your location. Built for Pakistan.

## What it does

- Asks for your location once, then lists the nearest mosques sorted by true GPS distance
- Tap any mosque for details, directions, and today's prayer times
- Prayer times are calculated for your location using the University of Islamic Sciences, Karachi method. They are not a specific mosque's announced jamaat times.

## Data

Mosque locations come from OpenStreetMap (`amenity=place_of_worship`, `religion=muslim`), collected October 2026. 410 mapped mosques in Lahore, 362 with names.

Coverage is honest: OpenStreetMap does not map every mosque, so the app shows exactly what is mapped and says so. No invented pins.

## Tech

- Expo (React Native), TypeScript, Expo Router
- `expo-location` for GPS, `adhan` for prayer-time calculation

## Run

```sh
npm install
npx expo start
```

## Build

```sh
npx eas-cli build --platform android --profile production
```
