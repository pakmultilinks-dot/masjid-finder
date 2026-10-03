import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

// Prayer times are CALCULATED for the user's location using the
// University of Islamic Sciences, Karachi method.
// They are NOT the announced jamaat times of any individual mosque.
// Never present these as a specific mosque's prayer schedule.
export interface DayPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

const fmt = new Intl.DateTimeFormat('en-PK', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZone: 'Asia/Karachi',
});

export function prayerTimesFor(lat: number, lon: number, date: Date = new Date()): DayPrayerTimes {
  const coords = new Coordinates(lat, lon);
  const params = CalculationMethod.Karachi();
  const times = new PrayerTimes(coords, date, params);
  return {
    fajr: fmt.format(times.fajr),
    sunrise: fmt.format(times.sunrise),
    dhuhr: fmt.format(times.dhuhr),
    asr: fmt.format(times.asr),
    maghrib: fmt.format(times.maghrib),
    isha: fmt.format(times.isha),
  };
}

export interface NextPrayer {
  name: string;
  at: Date;
  label: string;
}

const ORDER = [
  ['Fajr', 'fajr'],
  ['Sunrise', 'sunrise'],
  ['Dhuhr', 'dhuhr'],
  ['Asr', 'asr'],
  ['Maghrib', 'maghrib'],
  ['Isha', 'isha'],
] as const;

export function nextPrayer(lat: number, lon: number, now: Date = new Date()): NextPrayer {
  const coords = new Coordinates(lat, lon);
  const params = CalculationMethod.Karachi();
  for (let dayOffset = 0; dayOffset < 2; dayOffset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    const times = new PrayerTimes(coords, d, params);
    for (const [name, key] of ORDER) {
      const at = (times as any)[key] as Date;
      if (at.getTime() > now.getTime()) {
        return { name, at, label: fmt.format(at) };
      }
    }
  }
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  const times = new PrayerTimes(coords, d, params);
  return { name: 'Fajr', at: times.fajr, label: fmt.format(times.fajr) };
}

export function countdownText(target: Date, now: Date): string {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
