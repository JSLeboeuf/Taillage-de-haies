export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

// ============================================================================
// Authorization
// ============================================================================

function validateDashboardKey(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.slice(7);
  return token === process.env.DASHBOARD_KEY;
}

// ============================================================================
// GET /api/acquisitions/stats
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    if (!validateDashboardKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getSupabaseAdmin();

    // Count by status
    const { data: statusCounts } = await db
      .from("acquisition_prospects")
      .select("status")
      .neq("status", "archived");

    const statusBreakdown: Record<string, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      in_discussion: 0,
      offer_made: 0,
      negotiating: 0,
      due_diligence: 0,
      agreed: 0,
      closed: 0,
      declined: 0,
    };

    statusCounts?.forEach((p) => {
      if (p.status in statusBreakdown) {
        statusBreakdown[p.status]++;
      }
    });

    // Count by sequence type
    const { data: sequenceCounts } = await db
      .from("acquisition_prospects")
      .select("sequence_type")
      .neq("status", "archived");

    const sequenceBreakdown: Record<string, number> = {
      cold: 0,
      warm: 0,
      referral: 0,
      partner: 0,
    };

    sequenceCounts?.forEach((p) => {
      if (p.sequence_type in sequenceBreakdown) {
        sequenceBreakdown[p.sequence_type]++;
      }
    });

    // Count emails sent this week and this month
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const { data: weekEmails } = await db
      .from("acquisition_activities")
      .select("id")
      .eq("activity_type", "email_sent")
      .gte("created_at", weekAgo.toISOString());

    const { data: monthEmails } = await db
      .from("acquisition_activities")
      .select("id")
      .eq("activity_type", "email_sent")
      .gte("created_at", monthAgo.toISOString());

    // Count replies
    const { data: replies } = await db
      .from("acquisition_prospects")
      .select("id")
      .not("replied_at", "is", null)
      .neq("status", "archived");

    // Get total prospects for response rate
    const { data: allProspects } = await db
      .from("acquisition_prospects")
      .select("id")
      .neq("status", "archived");

    const responseRate =
      allProspects && allProspects.length > 0
        ? ((replies?.length || 0) / allProspects.length) * 100
        : 0;

    // Count prospects with next_email_at within 7 days
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const { data: upcomingEmails } = await db
      .from("acquisition_prospects")
      .select("id")
      .not("next_email_at", "is", null)
      .gte("next_email_at", today.toISOString())
      .lte("next_email_at", in7Days.toISOString());

    return NextResponse.json({
      summary: {
        total_prospects: allProspects?.length || 0,
        active_prospects: statusCounts?.length || 0,
        total_replies: replies?.length || 0,
        response_rate: Number(responseRate.toFixed(2)),
      },
      status_breakdown: statusBreakdown,
      sequence_breakdown: sequenceBreakdown,
      activity: {
        emails_sent_this_week: weekEmails?.length || 0,
        emails_sent_this_month: monthEmails?.length || 0,
        upcoming_emails_7_days: upcomingEmails?.length || 0,
      },
    });
  } catch (error) {
    console.error("GET /acquisitions/stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
