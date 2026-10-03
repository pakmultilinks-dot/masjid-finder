# Masjid Finder v2 — Design Document

Research basis: Islam360 (home icon grid, prayer alarms, Google-Maps mosque list),
Muslim Pro / modern Islamic apps ("Modern Islamic Minimalism": botanical green,
restrained bronze/gold, warm surfaces, low-elevation cards, clear hierarchy),
Hisn al-Muslim showcase (deep green + teal, rounded cards, calm visual language).

## Design language

- Deep emerald `#0C5C40` (primary), darker `#083D2B` (prayer hero)
- Gold `#C6A15B` (accents, active states, logo details)
- Warm ivory `#F7F4EC` (app background), white cards, ink `#1C1B1A`, muted `#6B675F`
- Display font: Marcellus (app name, headings, prayer names). Body: system.
  No Arabic calligraphy in v2 (kept minimal per user feedback).
- Rounded cards (16px radius), soft shadows, generous spacing. No raw coordinates
  or developer text anywhere in the main UI.

## Logo (hand-drawn geometric mark, no AI raster)

Rounded-square deep-green badge. Gold crescent top-center, ivory dome arc,
two gold minarets, and a gold location-pin merged as the central door/anchor
(inspired by a user-supplied reference, drawn originally). Delivered as SVG
(`docs/logo-final.svg`), rendered to PNG for app icon, adaptive icon, and
splash. Used on splash, home header, and detail screen.

## Screens

1. **Splash** — logo mark centered on deep green, "Masjid Finder" in Marcellus,
   tagline "Find masjid near you". Fades to Home.
2. **Home tab** —
   - Header: logo mini + "Masjid Finder", date line.
   - Next-prayer hero card (deep green gradient, gold accents): prayer name in
     large Marcellus, live countdown "2h 14m left", today's full mini-timetable
     below it.
   - "Nearest mosque" card: name, distance badge ("68 m"), "Get directions"
     button. Tapping opens details.
   - Quick actions row: Find mosques, Prayer times, Suggest a mosque.
   - Footer note (small, honest): "Mosque locations: OpenStreetMap contributors."
3. **Mosques tab** — search bar, then cards: name, distance badge, city line
   ("Lahore"), chevron. Sorted by true GPS distance. No coordinates shown.
4. **Prayer tab** — full timetable (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha),
   next prayer highlighted in green, each row with time. Disclaimer line:
   "Calculated for your location (Karachi method). Not mosque jamaat times."
5. **Mosque detail** — big name, distance badge, gold "Get directions" button,
   today's prayer times mini-list, "Suggest a correction" (copies details so the
   user can send them), data-source footnote.
6. **Suggest a mosque** — name field + "use my current location" + save.
   Stored on the device, shown in the list with an "Added by you" badge.
   This is how coverage honestly grows without inventing data.

## Navigation

Bottom tabs: Home, Mosques, Prayer. Detail and Suggest screens push on top.

## Performance

- `getLastKnownPositionAsync()` first: list paints instantly from the last fix.
- `getCurrentPositionAsync()` after: refines distances silently.
- Sorted list memoized; no recompute per render.

## Data honesty rules (unchanged)

- Only real OSM coordinates ship. Nothing invented, ever.
- Google Maps / Places coverage needs a Google Cloud API key with billing on the
  owner's account. The app will be built with a clean data-source interface so a
  Places key can be plugged in later without redesign.
- "Suggest a mosque" entries are clearly badged as user-added.

## Build order

1. Design approved (this doc + HTML mockup).
2. Implement: theme, logo SVG, splash, tabs, home, mosques, prayer, detail,
   suggest flow, fast location.
3. tsc + expo-doctor + bundle export.
4. GitHub push, EAS test build, staged rollout link.
