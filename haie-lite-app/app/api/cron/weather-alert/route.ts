export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { servicem8 } from "@/lib/servicem8";
import { sendSMS } from "@/lib/twilio";
import { supabaseAdmin } from "@/lib/supabase";
import { SMS } from "@/lib/sms-templates";
import {
  analyzeWeatherForDates,
  findNextAvailableSlot,
  processStaleReschedules,
  getNextDays,
  mapAlertType,
} from "@/lib/weather-scheduler";

const MONTREAL_LAT = 45.5017;
const MONTREAL_LON = -73.5673;
const MAX_JOBS_PER_RUN = 10;

/**
 * Cron: Weather-based intelligent scheduler
 * Schedule: Daily at 20:00 EDT (00:00 UTC next day)
 * Checks 3-day forecast, auto-reschedules affected jobs, notifies clients + employees
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Step 0: Auto-confirm stale reschedules from previous runs
    const autoConfirmed = await processStaleReschedules(supabaseAdmin);

    // Step 1: Fetch 5-day forecast from OpenWeather (1 API call, 40 data points)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${MONTREAL_LAT}&lon=${MONTREAL_LON}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (!weatherData.list) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid weather data from OpenWeather",
          auto_confirmed: autoConfirmed,
        },
        { status: 500 },
      );
    }

    // Step 2: Analyze weather for J+1, J+2, J+3
    const targetDates = getNextDays(3);
    const decisions = analyzeWeatherForDates(weatherData.list, targetDates);
    const cancelDates = decisions.filter((d) => d.decision === "cancel");
    const cautionDates = decisions.filter((d) => d.decision === "caution");

    // If no cancellations, just notify caution and exit
    if (cancelDates.length === 0) {
      // Caution alerts (heat) → notify Henri only
      if (cautionDates.length > 0 && process.env.HENRI_PHONE) {
        const cautionMsg = cautionDates
          .map((d) => `${d.date}: ${d.reason}`)
          .join("\n");
        await sendSMS(
          process.env.HENRI_PHONE,
          `METEO (prudence):\n${cautionMsg}\n\nAucune annulation. Ajustez les heures si necessaire.`,
        );
      }
      return NextResponse.json({
        success: true,
        message:
          cancelDates.length === 0 ? "No cancellations needed" : undefined,
        auto_confirmed: autoConfirmed,
        caution_dates: cautionDates.map((d) => d.date),
      });
    }

    // Step 3: Fetch scheduled activities for cancelled dates
    const allActivities: any[] = [];
    for (const d of cancelDates) {
      const activities = await servicem8.getScheduledActivitiesForDate(d.date);
      allActivities.push(
        ...activities.map((a) => ({
          ...a,
          cancelDate: d.date,
          reason: d.reason,
        })),
      );
    }

    // Deduplicate by job_uuid (one reschedule per job, not per activity)
    const seenJobs = new Set<string>();
    const uniqueActivities = allActivities.filter((a) => {
      if (seenJobs.has(a.job_uuid)) return false;
      seenJobs.add(a.job_uuid);
      return true;
    });

    // Step 4: Exclude jobs already rescheduled recently
    const jobUuids = uniqueActivities.map((a) => a.job_uuid);
    const { data: existingReschedules } = await supabaseAdmin
      .from("weather_reschedules")
      .select("job_uuid")
      .in("job_uuid", jobUuids.length > 0 ? jobUuids : ["__none__"])
      .in("status", [
        "pending_confirmation",
        "confirmed",
        "auto_confirmed",
        "servicem8_updated",
      ]);

    const alreadyRescheduled = new Set(
      (existingReschedules || []).map((r) => r.job_uuid),
    );
    const toReschedule = uniqueActivities
      .filter((a) => !alreadyRescheduled.has(a.job_uuid))
      .slice(0, MAX_JOBS_PER_RUN);

    // Step 5: Log weather alert
    const primaryDecision = cancelDates[0];
    const { data: alertRow } = await supabaseAdmin
      .from("weather_alerts")
      .insert({
        date: new Date().toISOString().split("T")[0],
        alert_type: mapAlertType(primaryDecision.reason),
        severity: "high",
        description: cancelDates
          .map((d) => `${d.date}: ${d.reason}`)
          .join("; "),
        temperature_c: primaryDecision.details.maxTemp,
        wind_speed_kmh: primaryDecision.details.maxWind,
        precipitation_mm: primaryDecision.details.maxRain,
        jobs_affected: toReschedule.length,
        affected_job_uuids: toReschedule.map((a) => a.job_uuid),
        reschedule_run_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    const alertId = alertRow?.id;

    // Step 6: Reschedule each job + notify customer
    let smsCount = 0;
    const rescheduled: { job: string; from: string; to: string }[] = [];

    for (const activity of toReschedule) {
      try {
        // Find next available slot for this staff member
        const newDate = await findNextAvailableSlot(
          activity.staff_uuid,
          activity.cancelDate,
          decisions,
        );

        if (!newDate) continue;

        // Get customer info from ServiceM8
        const job = await servicem8.getJob(activity.job_uuid);
        if (!job.company_uuid) continue;

        const contacts = await servicem8.getContacts(job.company_uuid);
        const contact = contacts[0];
        if (!contact?.mobile) continue;

        const company = await servicem8.getCompany(job.company_uuid);
        const customerName = contact.first || company.name.split(" ")[0];

        // Format dates for SMS
        const origDateFr = formatDateFr(activity.cancelDate);
        const newDateFr = formatDateFr(newDate);

        // Insert reschedule record
        await supabaseAdmin.from("weather_reschedules").insert({
          weather_alert_id: alertId,
          job_uuid: activity.job_uuid,
          activity_uuid: activity.uuid,
          company_uuid: job.company_uuid,
          customer_phone: contact.mobile,
          customer_name: customerName,
          original_date: activity.cancelDate,
          new_date: newDate,
          weather_reason: activity.reason,
          status: "pending_confirmation",
          sms_sent_at: new Date().toISOString(),
          auto_confirm_after: new Date(
            Date.now() + 20 * 60 * 60 * 1000,
          ).toISOString(),
        });

        // Send interactive SMS to customer
        await sendSMS(
          contact.mobile,
          SMS.weatherDelay(
            customerName,
            origDateFr,
            newDateFr,
            activity.reason,
          ),
        );
        smsCount++;
        rescheduled.push({
          job: activity.job_uuid,
          from: activity.cancelDate,
          to: newDate,
        });
      } catch (err) {
        console.error(`Failed to reschedule job ${activity.job_uuid}:`, err);
      }
    }

    // Step 7: Update weather_alerts counts
    if (alertId) {
      await supabaseAdmin
        .from("weather_alerts")
        .update({
          jobs_rescheduled: rescheduled.length,
          sms_sent: smsCount,
          customers_notified: smsCount > 0,
          henri_notified: true,
        })
        .eq("id", alertId);
    }

    // Step 8: Notify Henri with summary
    if (process.env.HENRI_PHONE) {
      const summary = [
        `METEO — ALERTE`,
        ...cancelDates.map((d) => `${d.date}: ${d.reason}`),
        "",
        `${rescheduled.length} job(s) reportes:`,
        ...rescheduled.slice(0, 5).map((r) => `  ${r.from} -> ${r.to}`),
        rescheduled.length > 5
          ? `  ... et ${rescheduled.length - 5} autres`
          : "",
        "",
        `${smsCount} client(s) notifies par SMS.`,
        autoConfirmed > 0
          ? `${autoConfirmed} reschedule(s) auto-confirme(s).`
          : "",
      ]
        .filter(Boolean)
        .join("\n");

      await sendSMS(process.env.HENRI_PHONE, summary);
    }

    // Step 9: Notify crew leaders
    await notifyCrewLeaders(rescheduled, supabaseAdmin);

    return NextResponse.json({
      success: true,
      executed_at: new Date().toISOString(),
      auto_confirmed: autoConfirmed,
      cancel_dates: cancelDates.map((d) => ({
        date: d.date,
        reason: d.reason,
      })),
      caution_dates: cautionDates.map((d) => ({
        date: d.date,
        reason: d.reason,
      })),
      jobs_affected: toReschedule.length,
      jobs_rescheduled: rescheduled.length,
      customers_notified: smsCount,
    });
  } catch (error) {
    console.error("Weather scheduler error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed",
      },
      { status: 500 },
    );
  }
}

/**
 * Notify crew leaders about rescheduled jobs for their truck
 */
async function notifyCrewLeaders(
  rescheduled: { job: string; from: string; to: string }[],
  supabase: SupabaseClient,
) {
  if (rescheduled.length === 0) return;

  // Get employees with phone numbers
  const { data: employees } = await supabase
    .from("employees")
    .select("id, first_name, phone, truck, role")
    .eq("is_active", true)
    .not("phone", "is", null);

  if (!employees?.length) return;

  // Get unique dates affected
  const affectedDates = [...new Set(rescheduled.map((r) => r.from))];

  // Notify employees who have a truck assignment (crew leaders)
  const leaders = employees.filter((e) => e.truck && e.phone);

  for (const leader of leaders) {
    const dateStr = affectedDates.map((d) => formatDateFr(d)).join(", ");
    await sendSMS(
      leader.phone,
      SMS.weatherDelayEmployee(leader.truck, dateStr, rescheduled.length),
    );
  }
}

/**
 * Format YYYY-MM-DD to French date string (ex: "3 avril")
 */
function formatDateFr(dateStr: string): string {
  const months = [
    "janvier",
    "fevrier",
    "mars",
    "avril",
    "mai",
    "juin",
    "juillet",
    "aout",
    "septembre",
    "octobre",
    "novembre",
    "decembre",
  ];
  const [, m, d] = dateStr.split("-");
  return `${parseInt(d)} ${months[parseInt(m) - 1]}`;
}
