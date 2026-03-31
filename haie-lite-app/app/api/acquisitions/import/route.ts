export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { z } from "zod";

// ============================================================================
// Schemas
// ============================================================================

const ProspectImportItemSchema = z.object({
  company_name: z.string().min(1),
  owner_name: z.string().min(1),
  owner_email: z.string().email().optional(),
  owner_phone: z.string().optional(),
  territory: z.string().optional(),
  source: z.string().optional(),
  estimated_age_years: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

const ImportProspectsSchema = z.object({
  prospects: z.array(ProspectImportItemSchema).min(1).max(1000),
});

type ProspectImportItem = z.infer<typeof ProspectImportItemSchema>;

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
// POST /api/acquisitions/import
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!validateDashboardKey(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = ImportProspectsSchema.parse(body);

    const db = getSupabaseAdmin();

    // Track results
    const imported: string[] = [];
    const duplicates: string[] = [];
    const errors: string[] = [];

    // Get existing company names to check for duplicates
    const { data: existingProspects } = await db
      .from("acquisition_prospects")
      .select("company_name")
      .neq("status", "archived");

    const existingNames = new Set(
      (existingProspects || []).map((p) => p.company_name.toLowerCase()),
    );

    // Process each prospect
    for (const prospect of validated.prospects) {
      try {
        const companyNameLower = prospect.company_name.toLowerCase();

        // Check for duplicate
        if (existingNames.has(companyNameLower)) {
          duplicates.push(prospect.company_name);
          continue;
        }

        // Auto-calculate next_email_at if owner_email provided
        const next_email_at = prospect.owner_email
          ? new Date().toISOString()
          : null;

        // Create prospect
        const { data: createdProspect, error: createError } = await db
          .from("acquisition_prospects")
          .insert({
            company_name: prospect.company_name,
            owner_name: prospect.owner_name,
            owner_email: prospect.owner_email,
            owner_phone: prospect.owner_phone,
            territory: prospect.territory,
            source: prospect.source,
            estimated_age_years: prospect.estimated_age_years,
            sequence_type: "cold",
            priority: "medium",
            notes: prospect.notes,
            next_email_at,
            sequence_step: 0,
            tags: [],
          })
          .select("id")
          .single();

        if (createError) {
          errors.push(`${prospect.company_name}: ${createError.message}`);
          continue;
        }

        if (createdProspect) {
          // Log activity
          await db.from("acquisition_activities").insert({
            prospect_id: createdProspect.id,
            activity_type: "status_changed",
            subject: "Prospect created via bulk import",
            old_value: null,
            new_value: "new",
          });

          imported.push(prospect.company_name);
          existingNames.add(companyNameLower);
        }
      } catch (error) {
        errors.push(
          `${prospect.company_name}: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }

    return NextResponse.json(
      {
        imported: imported.length,
        duplicates: duplicates.length,
        errors: errors.length,
        details: {
          imported_companies: imported,
          duplicate_companies: duplicates,
          error_messages: errors,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }

    console.error("POST /acquisitions/import error:", error);
    return NextResponse.json(
      { error: "Failed to import prospects" },
      { status: 500 },
    );
  }
}
