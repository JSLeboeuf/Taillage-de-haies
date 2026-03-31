export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

// ============================================================================
// Schemas
// ============================================================================

const UpdateProspectSchema = z.object({
  status: z
    .enum([
      "new",
      "contacted",
      "qualified",
      "in_discussion",
      "offer_made",
      "negotiating",
      "due_diligence",
      "agreed",
      "closed",
      "declined",
      "archived",
    ])
    .optional(),
  sequence_type: z.enum(["cold", "warm", "referral", "partner"]).optional(),
  sequence_step: z.number().int().min(0).max(5).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  notes: z.string().optional(),
  call_notes: z.string().optional(),
  offer_plan_a: z.string().optional(),
  offer_plan_b: z.string().optional(),
  deal_structure: z.string().optional(),
  next_email_at: z.string().datetime().optional(),
  next_followup_at: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  assigned_to: z.string().optional(),
});

type UpdateProspectInput = z.infer<typeof UpdateProspectSchema>;

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
// GET /api/acquisitions/prospects/[id]
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authorization
    if (!validateDashboardKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getSupabaseAdmin();
    const { id } = params;

    // Validate UUID format
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid prospect ID" },
        { status: 400 },
      );
    }

    // Fetch prospect
    const { data: prospect, error: prospectError } = await db
      .from("acquisition_prospects")
      .select("*")
      .eq("id", id)
      .single();

    if (prospectError || !prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 },
      );
    }

    // Fetch activities
    const { data: activities } = await db
      .from("acquisition_activities")
      .select("*")
      .eq("prospect_id", id)
      .order("created_at", { ascending: false });

    // Count emails sent
    const emailsCount =
      activities?.filter((a) => a.activity_type === "email_sent").length || 0;

    return NextResponse.json({
      prospect: {
        ...prospect,
        emails_sent_count: emailsCount,
      },
      activities: activities || [],
    });
  } catch (error) {
    console.error("GET /acquisitions/prospects/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ============================================================================
// PATCH /api/acquisitions/prospects/[id]
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authorization
    if (!validateDashboardKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getSupabaseAdmin();
    const { id } = params;

    // Validate UUID format
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid prospect ID" },
        { status: 400 },
      );
    }

    // Fetch current prospect
    const { data: currentProspect, error: fetchError } = await db
      .from("acquisition_prospects")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !currentProspect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const validated = UpdateProspectSchema.parse(body);

    // Build update object
    const updateData: Record<string, unknown> = { ...validated };

    // If sequence_type is being changed, reset sequence_step and next_email_at
    if (
      validated.sequence_type &&
      validated.sequence_type !== currentProspect.sequence_type
    ) {
      updateData.sequence_step = 0;
      updateData.next_email_at = new Date().toISOString();
    }

    // Update prospect
    const { data: updatedProspect, error: updateError } = await db
      .from("acquisition_prospects")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Update prospect error:", updateError);
      return NextResponse.json(
        { error: "Failed to update prospect" },
        { status: 500 },
      );
    }

    // Log status change
    if (validated.status && validated.status !== currentProspect.status) {
      await db.from("acquisition_activities").insert({
        prospect_id: id,
        activity_type: "status_changed",
        subject: `Status updated from ${currentProspect.status} to ${validated.status}`,
        old_value: currentProspect.status,
        new_value: validated.status,
      });
    }

    // Log note addition
    if (validated.notes && validated.notes !== currentProspect.notes) {
      await db.from("acquisition_activities").insert({
        prospect_id: id,
        activity_type: "note_added",
        subject: "Note added",
        notes: validated.notes,
      });
    }

    return NextResponse.json({
      success: true,
      prospect: updatedProspect,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("PATCH /acquisitions/prospects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update prospect" },
      { status: 500 },
    );
  }
}

// ============================================================================
// DELETE /api/acquisitions/prospects/[id]
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Check authorization
    if (!validateDashboardKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getSupabaseAdmin();
    const { id } = params;

    // Validate UUID format
    if (
      !id ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id,
      )
    ) {
      return NextResponse.json(
        { error: "Invalid prospect ID" },
        { status: 400 },
      );
    }

    // Check if prospect exists
    const { data: prospect, error: fetchError } = await db
      .from("acquisition_prospects")
      .select("id, status")
      .eq("id", id)
      .single();

    if (fetchError || !prospect) {
      return NextResponse.json(
        { error: "Prospect not found" },
        { status: 404 },
      );
    }

    // Archive prospect (soft delete)
    const { error: archiveError } = await db
      .from("acquisition_prospects")
      .update({ status: "archived" })
      .eq("id", id);

    if (archiveError) {
      console.error("Archive prospect error:", archiveError);
      return NextResponse.json(
        { error: "Failed to archive prospect" },
        { status: 500 },
      );
    }

    // Log activity
    await db.from("acquisition_activities").insert({
      prospect_id: id,
      activity_type: "status_changed",
      subject: `Prospect archived (was ${prospect.status})`,
      old_value: prospect.status,
      new_value: "archived",
    });

    return NextResponse.json({
      success: true,
      message: "Prospect archived",
    });
  } catch (error) {
    console.error("DELETE /acquisitions/prospects/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to archive prospect" },
      { status: 500 },
    );
  }
}
