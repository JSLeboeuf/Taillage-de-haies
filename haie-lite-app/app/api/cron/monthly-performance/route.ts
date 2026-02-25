import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendSMS } from '@/lib/twilio';
import { servicem8 } from '@/lib/servicem8';

/**
 * Cron: Monthly performance report
 * Schedule: 1st of month at 8:00am EDT (12:00 UTC)
 * Comprehensive monthly business performance analysis
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Calculate previous month boundaries
    const today = new Date();
    const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(firstOfThisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const monthStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
    const monthEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);

    const monthStartStr = monthStart.toISOString().split('T')[0];
    const monthEndStr = monthEnd.toISOString().split('T')[0];
    const monthName = monthStart.toLocaleDateString('fr-CA', { month: 'long', year: 'numeric', timeZone: 'America/Toronto' });

    // Same month last year
    const lastYearMonth = new Date(monthStart);
    lastYearMonth.setFullYear(lastYearMonth.getFullYear() - 1);
    const lastYearStart = new Date(lastYearMonth.getFullYear(), lastYearMonth.getMonth(), 1);
    const lastYearEnd = new Date(lastYearMonth.getFullYear(), lastYearMonth.getMonth() + 1, 0);
    const lastYearStartStr = lastYearStart.toISOString().split('T')[0];
    const lastYearEndStr = lastYearEnd.toISOString().split('T')[0];

    // Get completed jobs from ServiceM8 for the month
    const jobs = await servicem8.getJobs(
      `status eq 'Completed' and completion_date ge '${monthStartStr}' and completion_date le '${monthEndStr}'`
    );

    const totalRevenue = jobs.reduce((sum, job) => sum + parseFloat(job.total_invoice_amount || '0'), 0);
    const totalJobs = jobs.length;
    const avgTicket = totalJobs > 0 ? totalRevenue / totalJobs : 0;

    // Get new customers (unique company_uuids)
    const uniqueCompanies = new Set(jobs.map(j => j.company_uuid).filter(Boolean));
    const newCustomers = uniqueCompanies.size;

    // Get conversion rate from Supabase
    const { data: monthKpis } = await supabaseAdmin
      .from('daily_kpis')
      .select('*')
      .gte('date', monthStartStr)
      .lte('date', monthEndStr);

    const totalLeads = (monthKpis || []).reduce((sum, k) => sum + (k.leads_received || 0), 0);
    const conversionRate = totalLeads > 0 ? Math.round((totalJobs / totalLeads) * 100) : 0;

    // Get top employee from timesheets
    const { data: timesheets } = await supabaseAdmin
      .from('timesheets')
      .select('employee_id, job_revenue')
      .gte('date', monthStartStr)
      .lte('date', monthEndStr);

    const employeeRevenue: Record<string, number> = {};
    (timesheets || []).forEach(ts => {
      const empId = ts.employee_id;
      employeeRevenue[empId] = (employeeRevenue[empId] || 0) + (ts.job_revenue || 0);
    });

    const topEmployeeId = Object.entries(employeeRevenue).sort((a, b) => b[1] - a[1])[0]?.[0];
    let topEmployeeName = 'N/A';
    let topEmployeeRevenue = 0;

    if (topEmployeeId) {
      const { data: topEmp } = await supabaseAdmin
        .from('employees')
        .select('first_name, last_name')
        .eq('id', topEmployeeId)
        .single();

      if (topEmp) {
        topEmployeeName = `${topEmp.first_name} ${topEmp.last_name}`;
        topEmployeeRevenue = employeeRevenue[topEmployeeId];
      }
    }

    // Get top city from jobs
    const cityRevenue: Record<string, number> = {};
    for (const job of jobs) {
      if (!job.company_uuid) continue;
      try {
        const company = await servicem8.getCompany(job.company_uuid);
        const city = company.address_city || 'Unknown';
        cityRevenue[city] = (cityRevenue[city] || 0) + parseFloat(job.total_invoice_amount || '0');
      } catch (err) {
        // Skip if company fetch fails
      }
    }

    const topCity = Object.entries(cityRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topCityRevenue = cityRevenue[topCity] || 0;

    // Get same month last year data
    const { data: lastYearKpis } = await supabaseAdmin
      .from('daily_kpis')
      .select('revenue, jobs_completed')
      .gte('date', lastYearStartStr)
      .lte('date', lastYearEndStr);

    const lastYearRevenue = (lastYearKpis || []).reduce((sum, k) => sum + (k.revenue || 0), 0);
    const lastYearJobs = (lastYearKpis || []).reduce((sum, k) => sum + (k.jobs_completed || 0), 0);

    const revenueGrowth = lastYearRevenue > 0
      ? Math.round(((totalRevenue - lastYearRevenue) / lastYearRevenue) * 100)
      : 0;
    const jobsGrowth = lastYearJobs > 0
      ? Math.round(((totalJobs - lastYearJobs) / lastYearJobs) * 100)
      : 0;

    // Calculate YTD progress toward 2M target
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearStartStr = yearStart.toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const { data: ytdKpis } = await supabaseAdmin
      .from('daily_kpis')
      .select('revenue')
      .gte('date', yearStartStr)
      .lte('date', todayStr);

    const ytdRevenue = (ytdKpis || []).reduce((sum, k) => sum + (k.revenue || 0), 0);
    const ytdTarget = 2000000;
    const ytdProgress = Math.round((ytdRevenue / ytdTarget) * 100);

    // Save monthly report to Supabase
    const reportData = {
      month: monthStartStr,
      month_name: monthName,
      total_revenue: Math.round(totalRevenue),
      total_jobs: totalJobs,
      new_customers: newCustomers,
      avg_ticket: Math.round(avgTicket),
      conversion_rate: conversionRate,
      top_employee: topEmployeeName,
      top_employee_revenue: Math.round(topEmployeeRevenue),
      top_city: topCity,
      top_city_revenue: Math.round(topCityRevenue),
      revenue_growth_yoy: revenueGrowth,
      jobs_growth_yoy: jobsGrowth,
      ytd_revenue: Math.round(ytdRevenue),
      ytd_progress: ytdProgress,
    };

    const { error: reportError } = await supabaseAdmin
      .from('monthly_performance_reports')
      .insert(reportData);

    if (reportError) {
      console.error('Failed to save monthly report:', reportError);
    }

    // Send detailed report SMS to Henri and Jean-Samuel
    const reportMessage = [
      `📊 RAPPORT MENSUEL ${monthName.toUpperCase()}`,
      ``,
      `REVENUS: ${Math.round(totalRevenue).toLocaleString('fr-CA')}$`,
      lastYearRevenue > 0 ? `  (${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}% vs l'an dernier)` : '',
      ``,
      `JOBS: ${totalJobs}`,
      lastYearJobs > 0 ? `  (${jobsGrowth > 0 ? '+' : ''}${jobsGrowth}% vs l'an dernier)` : '',
      ``,
      `TICKET MOYEN: ${Math.round(avgTicket)}$`,
      `NOUVEAUX CLIENTS: ${newCustomers}`,
      `TAUX CONVERSION: ${conversionRate}%`,
      ``,
      `TOP PERFORMER: ${topEmployeeName} (${Math.round(topEmployeeRevenue).toLocaleString('fr-CA')}$)`,
      `TOP VILLE: ${topCity} (${Math.round(topCityRevenue).toLocaleString('fr-CA')}$)`,
      ``,
      `YTD: ${Math.round(ytdRevenue).toLocaleString('fr-CA')}$ / 2M$ (${ytdProgress}%)`,
      ``,
      `Félicitations à toute l'équipe!`,
    ].filter(Boolean).join('\n');

    const recipients = [process.env.HENRI_PHONE, process.env.JEAN_SAMUEL_PHONE].filter(Boolean);
    for (const phone of recipients) {
      await sendSMS(phone!, reportMessage);
    }

    return NextResponse.json({
      success: true,
      message: 'Monthly performance report sent',
      executed_at: new Date().toISOString(),
      month: monthName,
      total_revenue: Math.round(totalRevenue),
      total_jobs: totalJobs,
      ytd_progress: ytdProgress,
    });
  } catch (error) {
    console.error('Monthly performance report error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed',
    }, { status: 500 });
  }
}
