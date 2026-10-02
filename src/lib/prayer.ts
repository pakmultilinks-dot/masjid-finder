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
