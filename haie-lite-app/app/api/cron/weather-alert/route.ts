import { NextRequest, NextResponse } from 'next/server';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS } from '@/lib/twilio';
import { supabaseAdmin } from '@/lib/supabase';

const MONTREAL_LAT = 45.5017;
const MONTREAL_LON = -73.5673;

/**
 * Cron: Weather alert for scheduled jobs
 * Schedule: Daily at 6:00am EDT (10:00 UTC)
 * Checks weather forecast and alerts team about potential delays
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Fetch weather forecast from OpenWeather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${MONTREAL_LAT}&lon=${MONTREAL_LON}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherData.list) {
      throw new Error('Invalid weather data');
    }

    // Analyze weather for today and tomorrow
    const alerts: string[] = [];
    const affectedDates: string[] = [];

    for (const forecast of weatherData.list) {
      const dt = new Date(forecast.dt * 1000);
      const dateStr = dt.toISOString().split('T')[0];

      if (dateStr !== todayStr && dateStr !== tomorrowStr) continue;

      const temp = forecast.main.temp;
      const rain = forecast.rain?.['3h'] || 0;
      const wind = forecast.wind.speed * 3.6; // m/s to km/h
      const weather = forecast.weather[0].main;

      // Check for concerning conditions
      if (rain > 10) {
        alerts.push(`Pluie forte (${rain.toFixed(1)}mm) - ${dateStr} ${dt.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' })}`);
        if (!affectedDates.includes(dateStr)) affectedDates.push(dateStr);
      }

      if (wind > 40) {
        alerts.push(`Vents forts (${wind.toFixed(0)}km/h) - ${dateStr} ${dt.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' })}`);
        if (!affectedDates.includes(dateStr)) affectedDates.push(dateStr);
      }

      if (temp > 32) {
        alerts.push(`Chaleur extrême (${temp.toFixed(0)}°C) - ${dateStr} ${dt.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' })}`);
        if (!affectedDates.includes(dateStr)) affectedDates.push(dateStr);
      }

      if (weather === 'Thunderstorm') {
        alerts.push(`Orages - ${dateStr} ${dt.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Toronto' })}`);
        if (!affectedDates.includes(dateStr)) affectedDates.push(dateStr);
      }
    }

    // If no alerts, exit early
    if (alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No weather alerts',
        executed_at: new Date().toISOString(),
      });
    }

    // Get scheduled jobs for affected dates
    const affectedJobs: any[] = [];
    for (const dateStr of affectedDates) {
      const jobs = await servicem8.getJobActivities(
        `start_date gt '${dateStr} 00:00:00' and start_date lt '${dateStr} 23:59:59' and active eq 1`
      );
      affectedJobs.push(...jobs);
    }

    // Log weather alert to Supabase
    const { error: insertError } = await supabaseAdmin
      .from('weather_alerts')
      .insert({
        date: todayStr,
        conditions: alerts,
        affected_dates: affectedDates,
        affected_jobs_count: affectedJobs.length,
        severity: alerts.some(a => a.includes('Orages') || a.includes('Pluie forte')) ? 'high' : 'medium',
      });

    if (insertError) {
      console.error('Failed to log weather alert:', insertError);
    }

    // Send SMS to Henri with summary
    const henriMessage = [
      `⚠️ ALERTE MÉTÉO`,
      ``,
      ...alerts.slice(0, 5),
      alerts.length > 5 ? `... et ${alerts.length - 5} autres` : '',
      ``,
      `Jobs affectés: ${affectedJobs.length}`,
      ``,
      `Planifiez ajustements au besoin.`,
    ].filter(Boolean).join('\n');

    if (process.env.HENRI_PHONE) {
      await sendSMS(process.env.HENRI_PHONE, henriMessage);
    }

    // Send SMS to affected customers (if severe weather only)
    const severeWeather = alerts.some(a => a.includes('Orages') || a.includes('Pluie forte'));
    let customersSent = 0;

    if (severeWeather && affectedJobs.length > 0) {
      const uniqueJobUuids = Array.from(new Set(affectedJobs.map(a => a.job_uuid)));

      for (const jobUuid of uniqueJobUuids.slice(0, 10)) { // Limit to 10 to avoid SMS spam
        try {
          const job = await servicem8.getJob(jobUuid);
          if (!job.company_uuid) continue;

          const company = await servicem8.getCompany(job.company_uuid);
          const contacts = await servicem8.getContacts(job.company_uuid);
          const contact = contacts[0];

          if (!contact?.mobile) continue;

          const customerMessage = `Bonjour ${contact.first || company.name.split(' ')[0]}, météo défavorable prévue pour votre rendez-vous. Notre équipe vous contactera pour confirmer ou reporter. Merci de votre compréhension. - Haie Lite`;

          await sendSMS(contact.mobile, customerMessage);
          customersSent++;
        } catch (err) {
          console.error(`Failed to notify customer for job ${jobUuid}:`, err);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Weather alerts sent',
      executed_at: new Date().toISOString(),
      alerts_count: alerts.length,
      affected_jobs: affectedJobs.length,
      customers_notified: customersSent,
    });
  } catch (error) {
    console.error('Weather alert error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    }, { status: 500 });
  }
}
