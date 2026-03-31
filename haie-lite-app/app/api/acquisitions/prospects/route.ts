export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

// ============================================================================
// Schemas
// ============================================================================

const CreateProspectSchema = z.object({
  company_name: z.string().min(1, "Company name required"),
  owner_name: z.string().min(1, "Owner name required"),
  owner_email: z.string().email().optional(),
  owner_phone: z.string().optional(),
  territory: z.string().optional(),
  source: z.string().optional(),
  estimated_age_years: z.number().int().positive().optional(),
  sequence_type: z
    .enum(["cold", "warm", "referral", "partner"])
    .default("cold"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

type CreateProspectInput = z.infer<typeof CreateProspectSchema>;

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
// GET /api/acquisitions/prospects
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Check authorization
    if (!validateDashboardKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getSupabaseAdmin();
    const url = new URL(request.url);

    // Query parameters
    const status = url.searchParams.get("status");
    const sequence_type = url.searchParams.get("sequence_type");
    const priority = url.searchParams.get("priority");
    const territory = url.searchParams.get("territory");
    const search = url.searchParams.get("search");
    const limit = Math.min(
      parseInt(url.searchParams.get("limit") || "100"),
      1000,
    );
    const offset = parseInt(url.searchParams.get("offset") || "0");

    let query = db
      .from("acquisition_prospects")
      .select("*", { count: "exact" });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (sequence_type && sequence_type !== "all") {
      query = query.eq("sequence_type", sequence_type);
    }
    if (priority && priority !== "all") {
      query = query.eq("priority", priority);
    }
    if (territory && territory !== "all") {
      query = query.eq("territory", territory);
    }

    // Fuzzy search on company_name or owner_name
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      query = query.or(
        `company_name.ilike.${searchLower},owner_name.ilike.${searchLower}`,
      );
    }

    // Sorting: priority DESC, next_email_at ASC
    query = query
      .order("priority", { ascending: false })
      .order("next_email_at", { ascending: true, nullsFirst: false });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch prospects" },
        { status: 500 },
      );
    }

    // Count emails sent per prospect (subquery)
    const emailCounts: Record<string, number> = {};
    if (data && data.length > 0) {
      const { data: activities } = await db
        .from("acquisition_activities")
        .select("prospect_id, activity_type")
        .in(
          "prospect_id",
          data.map((p) => p.id),
        )
        .eq("activity_type", "email_sent");

      if (activities) {
        activities.forEach((act) => {
          emailCounts[act.prospect_id] =
            (emailCounts[act.prospect_id] || 0) + 1;
        });
      }
    }

    // Enrich prospects with email counts
    const enriched = (data || []).map((prospect) => ({
      ...prospect,
      emails_sent_count:
        emailCounts[prospect.id] || prospect.emails_sent_count || 0,
    }));

    return NextResponse.json({
      prospects: enriched,
      pagination: { offset, limit, total: count || 0 },
    });
  } catch (error) {
    console.error("GET /acquisitions/prospects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST /api/acquisitions/prospects
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!validateDashboardKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = CreateProspectSchema.parse(body);

    const db = getSupabaseAdmin();

    // Check for duplicates (same company_name)
    const { data: existingProspects, error: checkError } = await db
      .from("acquisition_prospects")
      .select("id")
      .eq("company_name", validated.company_name)
      .eq("status", "!=", "archived")
      .limit(1);

    if (checkError) {
      console.error("Duplicate check error:", checkError);
      return NextResponse.json(
        { error: "Failed to check duplicates" },
        { status: 500 },
      );
    }

    if (existingProspects && existingProspects.length > 0) {
      return NextResponse.json(
        { error: "Prospect with this company name already exists" },
        { status: 409 },
      );
    }

    // Auto-calculate next_email_at if owner_email provided and sequence_type provided
    const next_email_at =
      validated.owner_email && validated.sequence_type
        ? new Date().toISOString()
        : null;

    // Create prospect
    const { data: prospect, error: createError } = await db
      .from("acquisition_prospects")
      .insert({
        company_name: validated.company_name,
        owner_name: validated.owner_name,
        owner_email: validated.owner_email,
        owner_phone: validated.owner_phone,
        territory: validated.territory,
        source: validated.source,
        estimated_age_years: validated.estimated_age_years,
        sequence_type: validated.sequence_type,
        priority: validated.priority,
        tags: validated.tags || [],
        notes: validated.notes,
        next_email_at,
        sequence_step: 0,
      })
      .select()
      .single();

    if (createError) {
      console.error("Create prospect error:", createError);
      return NextResponse.json(
        { error: "Failed to create prospect" },
        { status: 500 },
      );
    }

    // Log activity
    if (prospect) {
      await db.from("acquisition_activities").insert({
        prospect_id: prospect.id,
        activity_type: "status_changed",
        subject: "Prospect created",
        old_value: null,
        new_value: "new",
      });
    }

    return NextResponse.json(
      {
        success: true,
        prospect,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("POST /acquisitions/prospects error:", error);
    return NextResponse.json(
      { error: "Failed to create prospect" },
      { status: 500 },
    );
  }
}
