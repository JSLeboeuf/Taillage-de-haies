export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { servicem8 } from '@/lib/servicem8';
import { sendSMS } from '@/lib/twilio';
import { SMS } from '@/lib/sms-templates';

/**
 * Cron: Job confirmation reminders
 * Schedule: Daily at 2:00pm EDT (18:00 UTC)
 * Sends SMS reminders to customers with jobs scheduled for tomorrow
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const tomorrowDisplay = tomorrow.toLocaleDateString('fr-CA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });

    // Get scheduled jobs for tomorrow
    const activities = await servicem8.getJobActivities(
      `start_date gt '${tomorrowStr} 00:00:00' and start_date lt '${tomorrowStr} 23:59:59' and activity_was_scheduled eq '1'`
    );

    let sent = 0;
    let errors = 0;
    const seen = new Set<string>(); // Avoid duplicate SMS per job

    for (const activity of activities) {
      if (seen.has(activity.job_uuid)) continue;
      seen.add(activity.job_uuid);

      try {
        const job = await servicem8.getJob(activity.job_uuid);
        if (job.status !== 'Work Order') continue;

        const company = await servicem8.getCompany(job.company_uuid);
        const contacts = await servicem8.getContacts(job.company_uuid);
        const contact = contacts[0];

        if (!contact?.mobile) continue;

        const firstName = contact.first || company.name.split(' ')[0];
        await sendSMS(contact.mobile, SMS.jobConfirmationJ1(firstName, tomorrowDisplay));
        sent++;
      } catch (err) {
        console.error(`Confirmation error for job ${activity.job_uuid}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      date: tomorrowStr,
      jobs_found: activities.length,
      confirmations_sent: sent,
      errors,
    });
  } catch (error) {
    console.error('Job confirmation error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
