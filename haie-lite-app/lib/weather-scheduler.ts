import { servicem8 } from '@/lib/servicem8';
import type { SupabaseClient } from '@supabase/supabase-js';

// Weather decision thresholds for hedge trimming
const THRESHOLDS = {
  RAIN_CANCEL_MM: 5,       // >5mm/3h = cancel (electric tools + slippery)
  WIND_CANCEL_KMH: 40,     // >40km/h = dangerous (branches, ladders)
  WIND_CAUTION_KMH: 25,    // 25-40 = caution
  HEAT_CAUTION_C: 32,      // >32C = reduce hours (8h-12h only)
  FROST_CANCEL_C: -5,      // <-5C = cancel (cedar thermal stress)
};

export interface WeatherDecision {
  date: string;
  decision: 'cancel' | 'caution' | 'ok';
  reason: string;
  details: {
    maxRain: number;
    maxWind: number;
    maxTemp: number;
    minTemp: number;
    hasThunderstorm: boolean;
  };
}

interface ForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number };
  rain?: { '3h'?: number };
  wind: { speed: number };
  weather: { main: string; description: string }[];
}

/**
 * Analyze weather forecast for specific dates (working hours 6h-18h EDT only)
 */
export function analyzeWeatherForDates(
  forecastList: ForecastItem[],
  dates: string[]
): WeatherDecision[] {
  const decisions: WeatherDecision[] = [];

  for (const dateStr of dates) {
    const dayForecasts = forecastList.filter((f) => {
      const dt = new Date(f.dt * 1000);
      const fDate = dt.toLocaleDateString('en-CA', { timeZone: 'America/Toronto' });
      const hour = parseInt(dt.toLocaleTimeString('en-CA', { timeZone: 'America/Toronto', hour: '2-digit', hour12: false }));
      return fDate === dateStr && hour >= 6 && hour <= 18;
    });

    if (dayForecasts.length === 0) {
      decisions.push({ date: dateStr, decision: 'ok', reason: '', details: { maxRain: 0, maxWind: 0, maxTemp: 0, minTemp: 20, hasThunderstorm: false } });
      continue;
    }

    const maxRain = Math.max(...dayForecasts.map(f => f.rain?.['3h'] || 0));
    const maxWind = Math.max(...dayForecasts.map(f => f.wind.speed * 3.6));
    const maxTemp = Math.max(...dayForecasts.map(f => f.main.temp));
    const minTemp = Math.min(...dayForecasts.map(f => f.main.temp));
    const hasThunderstorm = dayForecasts.some(f => f.weather[0]?.main === 'Thunderstorm');

    const details = { maxRain, maxWind, maxTemp, minTemp, hasThunderstorm };
    const reasons: string[] = [];
    let decision: 'cancel' | 'caution' | 'ok' = 'ok';

    if (hasThunderstorm) {
      decision = 'cancel';
      reasons.push('orages');
    }
    if (maxRain > THRESHOLDS.RAIN_CANCEL_MM) {
      decision = 'cancel';
      reasons.push(`pluie forte (${maxRain.toFixed(0)}mm)`);
    }
    if (maxWind > THRESHOLDS.WIND_CANCEL_KMH) {
      decision = 'cancel';
      reasons.push(`vents forts (${maxWind.toFixed(0)}km/h)`);
    }
    if (minTemp < THRESHOLDS.FROST_CANCEL_C) {
      decision = 'cancel';
      reasons.push(`gel (${minTemp.toFixed(0)}C)`);
    }
    if (decision === 'ok' && maxTemp > THRESHOLDS.HEAT_CAUTION_C) {
      decision = 'caution';
      reasons.push(`chaleur (${maxTemp.toFixed(0)}C)`);
    }
    if (decision === 'ok' && maxWind > THRESHOLDS.WIND_CAUTION_KMH) {
      decision = 'caution';
      reasons.push(`vent modere (${maxWind.toFixed(0)}km/h)`);
    }

    decisions.push({
      date: dateStr,
      decision,
      reason: reasons.join(' + '),
      details,
    });
  }

  return decisions;
}

/**
 * Find the next available slot for a staff member after a given date
 * Avoids: Sundays, bad weather days, overloaded days (>8h)
 */
export async function findNextAvailableSlot(
  staffUuid: string,
  afterDate: string,
  weatherDecisions: WeatherDecision[],
  maxDaysAhead = 14
): Promise<string | null> {
  const badWeatherDates = new Set(
    weatherDecisions.filter(d => d.decision === 'cancel').map(d => d.date)
  );

  const start = new Date(afterDate + 'T00:00:00');

  for (let i = 1; i <= maxDaysAhead; i++) {
    const candidate = new Date(start);
    candidate.setDate(candidate.getDate() + i);
    const candidateStr = candidate.toISOString().split('T')[0];
    const dayOfWeek = candidate.getDay();

    // Skip Sundays
    if (dayOfWeek === 0) continue;

    // Skip bad weather days
    if (badWeatherDates.has(candidateStr)) continue;

    // Check staff load for this day
    try {
      const activities = await servicem8.getScheduledActivitiesForDate(candidateStr);
      const staffActivities = activities.filter(a => a.staff_uuid === staffUuid);

      // Calculate total scheduled hours
      let totalHours = 0;
      for (const act of staffActivities) {
        const start = new Date(act.start_date);
        const end = new Date(act.end_date);
        totalHours += (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }

      // Available if less than 8h scheduled
      if (totalHours < 8) {
        return candidateStr;
      }
    } catch {
      // If ServiceM8 call fails, skip this day
      continue;
    }
  }

  return null;
}

/**
 * Auto-confirm stale weather reschedules (no response after 20h)
 * Updates ServiceM8 and marks as auto_confirmed
 */
export async function processStaleReschedules(
  supabase: SupabaseClient
): Promise<number> {
  const { data: stale } = await supabase
    .from('weather_reschedules')
    .select('*')
    .eq('status', 'pending_confirmation')
    .lt('auto_confirm_after', new Date().toISOString());

  if (!stale?.length) return 0;

  let confirmed = 0;
  for (const r of stale) {
    try {
      await servicem8.updateJobActivity(r.activity_uuid, {
        start_date: `${r.new_date} 08:00:00`,
        end_date: `${r.new_date} 12:00:00`,
      });
      await supabase
        .from('weather_reschedules')
        .update({
          status: 'auto_confirmed',
          servicem8_updated: true,
          servicem8_updated_at: new Date().toISOString(),
        })
        .eq('id', r.id);
      confirmed++;
    } catch (err) {
      console.error(`Failed to auto-confirm reschedule ${r.id}:`, err);
    }
  }

  return confirmed;
}

/**
 * Get the next N days as YYYY-MM-DD strings
 */
export function getNextDays(count: number): string[] {
  const days: string[] = [];
  const now = new Date();
  for (let i = 1; i <= count; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/**
 * Map alert type from weather reason to DB enum
 */
export function mapAlertType(reason: string): string {
  if (reason.includes('orage')) return 'thunderstorm';
  if (reason.includes('pluie')) return 'heavy_rain';
  if (reason.includes('vent')) return 'high_winds';
  if (reason.includes('chaleur')) return 'extreme_heat';
  if (reason.includes('gel')) return 'ice';
  if (reason.includes('neige')) return 'snow';
  return 'heavy_rain';
}
