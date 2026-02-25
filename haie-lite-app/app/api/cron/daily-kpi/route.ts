import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, upsertDailyKPI } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';

/**
 * Cron: Daily KPI report
 * Schedule: Daily at 7:00am EDT (11:00 UTC)
 * Sends daily business metrics to Henri
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Yesterday's date (report is for previous day)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    // Get yesterday's data from ServiceM8
    const completedJobs = await servicem8.getJobs(
      `status eq 'Completed' and completion_date gt '${dateStr}'`
    );
    const newQuotes = await servicem8.getJobs(
      `status eq 'Quote' and create_date gt '${dateStr}'`
    );

    const revenue = completedJobs.reduce(
      (sum, job) => sum + parseFloat(job.total_invoice_amount || '0'), 0
    );
    const avgTicket = completedJobs.length > 0 ? revenue / completedJobs.length : 0;

    // Get leads received yesterday from Supabase
    const { count: leadsCount } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    const conversionRate = (leadsCount || 0) > 0
      ? Math.round(completedJobs.length / (leadsCount || 1) * 100)
      : 0;

    // Save KPI
    await upsertDailyKPI({
      date: dateStr,
      leads_received: leadsCount || 0,
      quotes_sent: newQuotes.length,
      jobs_completed: completedJobs.length,
      revenue: Math.round(revenue),
      avg_ticket: Math.round(avgTicket),
      conversion_rate: conversionRate,
    });

    // Get month-to-date totals
    const monthStart = dateStr.substring(0, 7) + '-01';
    const { data: monthKpis } = await supabaseAdmin
      .from('daily_kpis')
      .select('revenue, jobs_completed, leads_received')
      .gte('date', monthStart)
      .lte('date', dateStr);

    const mtdRevenue = (monthKpis || []).reduce((s, k) => s + (k.revenue || 0), 0);
    const mtdJobs = (monthKpis || []).reduce((s, k) => s + (k.jobs_completed || 0), 0);
    const mtdLeads = (monthKpis || []).reduce((s, k) => s + (k.leads_received || 0), 0);

    // Build report
    const report = [
      `KPI — ${dateStr}`,
      ``,
      `HIER:`,
      `Leads: ${leadsCount || 0}`,
      `Soumissions: ${newQuotes.length}`,
      `Jobs: ${completedJobs.length}`,
      `Revenus: ${Math.round(revenue)}$`,
      `Ticket moyen: ${Math.round(avgTicket)}$`,
      ``,
      `MOIS (MTD):`,
      `Leads: ${mtdLeads}`,
      `Jobs: ${mtdJobs}`,
      `Revenus: ${Math.round(mtdRevenue)}$`,
      ``,
      `Obj mensuel: 166,667$ (pour 2M$/an)`,
      `Progression: ${Math.round(mtdRevenue / 166667 * 100)}%`,
    ].join('\n');

    // Send to owners
    const recipients = [process.env.HENRI_PHONE, process.env.JEAN_SAMUEL_PHONE].filter(Boolean);
    for (const phone of recipients) {
      await sendSMS(phone!, report);
    }

    return NextResponse.json({
      success: true,
      date: dateStr,
      revenue: Math.round(revenue),
      jobs: completedJobs.length,
      leads: leadsCount,
    });
  } catch (error) {
    console.error('Daily KPI error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
