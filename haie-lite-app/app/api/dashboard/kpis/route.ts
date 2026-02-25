import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Dashboard KPIs endpoint
 * Returns real-time business metrics for COO dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    // Get month-to-date KPIs from daily_kpis table
    const { data: dailyKpis, error: kpisError } = await supabaseAdmin
      .from('daily_kpis')
      .select('*')
      .gte('date', monthStart)
      .order('date', { ascending: false });

    if (kpisError) {
      console.error('KPIs fetch error:', kpisError);
    }

    // Calculate MTD totals
    const mtdRevenue = (dailyKpis || []).reduce((sum, k) => sum + (k.revenue || 0), 0);
    const mtdJobs = (dailyKpis || []).reduce((sum, k) => sum + (k.jobs_completed || 0), 0);
    const mtdLeads = (dailyKpis || []).reduce((sum, k) => sum + (k.leads_received || 0), 0);
    const mtdQuotes = (dailyKpis || []).reduce((sum, k) => sum + (k.quotes_sent || 0), 0);

    // Today's KPIs
    const todayKpi = dailyKpis?.find(k => k.date === today);
    const jobsToday = todayKpi?.jobs_completed || 0;
    const revenueToday = todayKpi?.revenue || 0;

    // This week (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const weekKpis = (dailyKpis || []).filter(k => k.date >= weekAgoStr);
    const jobsThisWeek = weekKpis.reduce((sum, k) => sum + (k.jobs_completed || 0), 0);

    // Calculate conversion rate
    const conversionRate = mtdLeads > 0 ? (mtdJobs / mtdLeads) * 100 : 0;

    // Calculate average ticket
    const avgTicket = mtdJobs > 0 ? mtdRevenue / mtdJobs : 0;

    // Monthly target (2M$ / 12 = 166,667$)
    const monthlyTarget = 166667;
    const targetProgress = (mtdRevenue / monthlyTarget) * 100;

    // Get trend (compare to last month)
    const lastMonthStart = new Date(monthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthStartStr = lastMonthStart.toISOString().substring(0, 7) + '-01';
    const lastMonthEnd = new Date(monthStart);
    lastMonthEnd.setDate(0);
    const lastMonthEndStr = lastMonthEnd.toISOString().split('T')[0];

    const { data: lastMonthKpis } = await supabaseAdmin
      .from('daily_kpis')
      .select('revenue, jobs_completed')
      .gte('date', lastMonthStartStr)
      .lte('date', lastMonthEndStr);

    const lastMonthRevenue = (lastMonthKpis || []).reduce((sum, k) => sum + (k.revenue || 0), 0);
    const lastMonthJobs = (lastMonthKpis || []).reduce((sum, k) => sum + (k.jobs_completed || 0), 0);

    const revenueTrend = lastMonthRevenue > 0
      ? ((mtdRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;
    const jobsTrend = lastMonthJobs > 0
      ? ((mtdJobs - lastMonthJobs) / lastMonthJobs) * 100
      : 0;

    return NextResponse.json({
      success: true,
      kpis: {
        revenue: {
          today: Math.round(revenueToday),
          mtd: Math.round(mtdRevenue),
          target: monthlyTarget,
          progress: Math.round(targetProgress * 10) / 10,
          trend: Math.round(revenueTrend * 10) / 10,
        },
        jobs: {
          today: jobsToday,
          week: jobsThisWeek,
          mtd: mtdJobs,
          trend: Math.round(jobsTrend * 10) / 10,
        },
        leads: {
          mtd: mtdLeads,
        },
        conversion: {
          rate: Math.round(conversionRate * 10) / 10,
        },
        ticket: {
          avg: Math.round(avgTicket),
        },
        quotes: {
          mtd: mtdQuotes,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard KPIs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch KPIs',
        kpis: {
          revenue: { today: 0, mtd: 0, target: 166667, progress: 0, trend: 0 },
          jobs: { today: 0, week: 0, mtd: 0, trend: 0 },
          leads: { mtd: 0 },
          conversion: { rate: 0 },
          ticket: { avg: 0 },
          quotes: { mtd: 0 },
        },
      },
      { status: 200 } // Return 200 to allow graceful degradation
    );
  }
}
