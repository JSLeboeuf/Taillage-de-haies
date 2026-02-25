import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';
import { SMS } from '@/lib/sms-templates';

/**
 * Cron: Dormant customer reactivation
 * Schedule: 1st and 15th of month at 10:00am EDT (14:00 UTC)
 * Re-engages customers who haven't booked in 10-14 months (annual hedge clients about to lapse)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();

    // Calculate 10 months ago and 14 months ago
    const tenMonthsAgo = new Date(today);
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);
    const tenMonthsAgoStr = tenMonthsAgo.toISOString().split('T')[0];

    const fourteenMonthsAgo = new Date(today);
    fourteenMonthsAgo.setMonth(fourteenMonthsAgo.getMonth() - 14);
    const fourteenMonthsAgoStr = fourteenMonthsAgo.toISOString().split('T')[0];

    // Get all completed jobs from 10-14 months ago
    const oldJobs = await servicem8.getJobs(
      `status eq 'Completed' and completion_date ge '${fourteenMonthsAgoStr}' and completion_date le '${tenMonthsAgoStr}'`
    );

    if (!oldJobs || oldJobs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No dormant customers found',
        executed_at: new Date().toISOString(),
      });
    }

    // Group jobs by company to find customers who had multiple jobs in the past
    const companyJobs: Record<string, any[]> = {};
    for (const job of oldJobs) {
      if (!job.company_uuid) continue;
      if (!companyJobs[job.company_uuid]) {
        companyJobs[job.company_uuid] = [];
      }
      companyJobs[job.company_uuid].push(job);
    }

    // Filter to only qualified customers (had at least 1 job in that period)
    const qualifiedCompanies = Object.keys(companyJobs);

    // Check which companies have NOT had any jobs since then
    const dormantCompanies: string[] = [];

    for (const companyUuid of qualifiedCompanies) {
      const recentJobs = await servicem8.getJobs(
        `company_uuid eq '${companyUuid}' and completion_date gt '${tenMonthsAgoStr}'`
      );

      // If no recent jobs, this customer is dormant
      if (!recentJobs || recentJobs.length === 0) {
        dormantCompanies.push(companyUuid);
      }
    }

    if (dormantCompanies.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No dormant customers to reactivate',
        executed_at: new Date().toISOString(),
      });
    }

    // Limit to max 20 SMS per run to avoid spam
    const companiestoContact = dormantCompanies.slice(0, 20);
    let messagesSent = 0;
    const errors: string[] = [];

    for (const companyUuid of companiestoContact) {
      try {
        const company = await servicem8.getCompany(companyUuid);
        const contacts = await servicem8.getContacts(companyUuid);
        const contact = contacts[0];

        if (!contact?.mobile) {
          errors.push(`No mobile for company ${companyUuid}`);
          continue;
        }

        // Get last job date for personalization
        const lastJobs = companyJobs[companyUuid] || [];
        const lastJob = lastJobs.sort((a, b) =>
          new Date(b.completion_date).getTime() - new Date(a.completion_date).getTime()
        )[0];

        const lastJobDate = lastJob
          ? new Date(lastJob.completion_date).toLocaleDateString('fr-CA', {
              month: 'long',
              year: 'numeric',
              timeZone: 'America/Toronto'
            })
          : 'il y a plus d\'un an';

        const firstName = contact.first || company.name.split(' ')[0];
        const discount = 10; // 10% discount for returning customers

        // Send reactivation SMS using template
        const message = SMS.dormantReactivation(firstName, lastJobDate, discount);
        await sendSMS(contact.mobile, message);

        // Track in Supabase
        const { error: campaignError } = await supabaseAdmin
          .from('reactivation_campaigns')
          .insert({
            company_uuid: companyUuid,
            company_name: company.name,
            contact_phone: contact.mobile,
            last_job_date: lastJob?.completion_date,
            campaign_date: today.toISOString(),
            discount_offered: discount,
            status: 'sent',
          });

        if (campaignError && !campaignError.message.includes('duplicate')) {
          console.error('Failed to log reactivation campaign:', campaignError);
        }

        messagesSent++;
      } catch (err) {
        console.error(`Failed to reactivate company ${companyUuid}:`, err);
        errors.push(`Company ${companyUuid}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }

    // Send summary to Henri
    if (process.env.HENRI_PHONE && messagesSent > 0) {
      const summaryMessage = [
        `📢 CAMPAGNE RÉACTIVATION`,
        ``,
        `${messagesSent} clients inactifs contactés`,
        `Rabais offert: 10%`,
        ``,
        `Clients ciblés: dernière taille il y a 10-14 mois`,
        ``,
        `Suivez les réponses et bookings.`,
      ].join('\n');

      await sendSMS(process.env.HENRI_PHONE, summaryMessage);
    }

    return NextResponse.json({
      success: true,
      message: 'Dormant customer reactivation executed',
      executed_at: new Date().toISOString(),
      messages_sent: messagesSent,
      dormant_companies_found: dormantCompanies.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Dormant reactivation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    }, { status: 500 });
  }
}
