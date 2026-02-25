import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch all leads
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) {
      console.error('Leads fetch error:', leadsError);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Group by status
    const byStatus: Record<string, any> = {
      new: { count: 0, total_value: 0, leads: [] },
      contacted: { count: 0, total_value: 0, leads: [] },
      qualified: { count: 0, total_value: 0, leads: [] },
      quoted: { count: 0, total_value: 0, leads: [] },
      won: { count: 0, total_value: 0, leads: [] },
      lost: { count: 0, total_value: 0, leads: [] },
      dormant: { count: 0, total_value: 0, leads: [] },
    };

    let totalLeads = 0;
    let totalValue = 0;
    let totalWonValue = 0;
    let wonCount = 0;

    for (const lead of leads || []) {
      const status = lead.status || 'new';

      if (!byStatus[status]) {
        byStatus[status] = { count: 0, total_value: 0, leads: [] };
      }

      byStatus[status].count++;
      byStatus[status].leads.push({
        id: lead.id,
        name: lead.name,
        created_at: lead.created_at,
        quote_amount: lead.quote_amount,
      });

      totalLeads++;

      if (lead.quote_amount) {
        byStatus[status].total_value += lead.quote_amount;
        totalValue += lead.quote_amount;

        if (status === 'won') {
          totalWonValue += lead.quote_amount;
        }
      }

      if (status === 'won') {
        wonCount++;
      }
    }

    // Calculate conversion rates
    const newLeads = byStatus.new.count;
    const contactedLeads = byStatus.contacted.count + byStatus.qualified.count + byStatus.quoted.count + wonCount;
    const quotedLeads = byStatus.quoted.count + wonCount;

    const conversionRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0;
    const winRate = quotedLeads > 0 ? (wonCount / quotedLeads) * 100 : 0;
    const avgDealSize = wonCount > 0 ? totalWonValue / wonCount : 0;

    // Calculate velocity metrics (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoISO = oneWeekAgo.toISOString();

    const leadsAddedThisWeek = (leads || []).filter(
      (l) => l.created_at >= oneWeekAgoISO
    ).length;

    const leadsConvertedThisWeek = (leads || []).filter(
      (l) => l.status === 'won' && l.won_at && l.won_at >= oneWeekAgoISO
    ).length;

    const revenueClosedThisWeek = (leads || [])
      .filter((l) => l.status === 'won' && l.won_at && l.won_at >= oneWeekAgoISO)
      .reduce((sum, l) => sum + (l.quote_amount || 0), 0);

    // Average time in each stage (simplified - would need better tracking)
    const avgTimeInStages = {
      new_to_contacted: 1.5, // days (placeholder)
      contacted_to_qualified: 2.0,
      qualified_to_quoted: 1.0,
      quoted_to_won: 7.0,
    };

    // Month-over-month trends
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthLeads = (leads || []).filter(
      (l) => new Date(l.created_at) >= thisMonthStart
    ).length;

    const lastMonthLeads = (leads || []).filter(
      (l) => new Date(l.created_at) >= lastMonthStart && new Date(l.created_at) < thisMonthStart
    ).length;

    const thisMonthWon = (leads || []).filter(
      (l) => l.status === 'won' && l.won_at && new Date(l.won_at) >= thisMonthStart
    ).length;

    const lastMonthWon = (leads || []).filter(
      (l) => l.status === 'won' && l.won_at &&
           new Date(l.won_at) >= lastMonthStart && new Date(l.won_at) < thisMonthStart
    ).length;

    const thisMonthRevenue = (leads || [])
      .filter((l) => l.status === 'won' && l.won_at && new Date(l.won_at) >= thisMonthStart)
      .reduce((sum, l) => sum + (l.quote_amount || 0), 0);

    const lastMonthRevenue = (leads || [])
      .filter((l) => l.status === 'won' && l.won_at &&
               new Date(l.won_at) >= lastMonthStart && new Date(l.won_at) < thisMonthStart)
      .reduce((sum, l) => sum + (l.quote_amount || 0), 0);

    return NextResponse.json({
      success: true,
      pipeline: {
        by_status: byStatus,
        metrics: {
          total_leads: totalLeads,
          total_value: Math.round(totalValue),
          total_won_value: Math.round(totalWonValue),
          conversion_rate: Math.round(conversionRate * 10) / 10,
          win_rate: Math.round(winRate * 10) / 10,
          avg_deal_size: Math.round(avgDealSize),
          avg_time_in_stages: avgTimeInStages,
        },
        velocity: {
          leads_added_this_week: leadsAddedThisWeek,
          leads_converted_this_week: leadsConvertedThisWeek,
          revenue_closed_this_week: Math.round(revenueClosedThisWeek),
        },
        trends: {
          month_over_month: {
            leads: {
              this_month: thisMonthLeads,
              last_month: lastMonthLeads,
              change_pct: lastMonthLeads > 0
                ? Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100)
                : 0,
            },
            conversions: {
              this_month: thisMonthWon,
              last_month: lastMonthWon,
              change_pct: lastMonthWon > 0
                ? Math.round(((thisMonthWon - lastMonthWon) / lastMonthWon) * 100)
                : 0,
            },
            revenue: {
              this_month: Math.round(thisMonthRevenue),
              last_month: Math.round(lastMonthRevenue),
              change_pct: lastMonthRevenue > 0
                ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
                : 0,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error('Pipeline analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline analytics' },
      { status: 500 }
    );
  }
}
