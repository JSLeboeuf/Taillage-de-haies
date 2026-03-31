import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendEmail } from "@/lib/resend";
import {
  getAcquisitionEmail,
  getNextEmailDelay,
  AcquisitionProspect,
} from "@/lib/acquisition-emails";

interface AcquisitionProspectRow extends AcquisitionProspect {
  next_email_at: string | null;
  last_email_sent_at: string | null;
  created_at: string;
}

interface EmailLog {
  prospect_id: string;
  sequence_type: string;
  sequence_step: number;
  subject: string;
  body_text: string;
  body_html: string | null;
  resend_id: string;
  sent_at: string;
}

interface ActivityLog {
  prospect_id: string;
  activity_type: "email_sent" | "sequence_complete" | "error";
  description: string;
  metadata?: Record<string, unknown>;
}

interface CronResult {
  processed: number;
  sent: number;
  errors: string[];
}

/**
 * Cron: Acquisition outreach automation
 * Schedule: Mon-Fri at 14:00 UTC (10:00 EDT)
 * Sends multi-touch acquisition emails based on prospect sequence and priority
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<CronResult | { error: string }>> {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getSupabaseAdmin();
    const result: CronResult = { processed: 0, sent: 0, errors: [] };

    // Query prospects ready for next email
    const { data: prospects, error: queryError } = await db
      .from("acquisition_prospects")
      .select("*")
      .lte("next_email_at", new Date().toISOString())
      .not("next_email_at", "is", null)
      .in("status", ["new", "contacted", "qualified", "nurture"])
      .not("owner_email", "is", null)
      .order("priority", { ascending: false })
      .order("next_email_at", { ascending: true })
      .limit(20);

    if (queryError) {
      throw new Error(`Query failed: ${queryError.message}`);
    }

    if (!prospects || prospects.length === 0) {
      return NextResponse.json(result);
    }

    // Process each prospect
    for (const prospect of prospects as unknown as AcquisitionProspectRow[]) {
      result.processed++;

      try {
        // Get next email template
        const nextStep = prospect.sequence_step + 1;
        const emailTemplate = getAcquisitionEmail(
          prospect as AcquisitionProspect,
          prospect.sequence_type as AcquisitionProspect["sequence_type"],
          nextStep,
        );

        if (!emailTemplate) {
          // Sequence complete
          await db
            .from("acquisition_prospects")
            .update({
              next_email_at: null,
              status:
                prospect.sequence_type === "cold" ||
                prospect.sequence_type === "blast"
                  ? "nurture"
                  : prospect.status,
            })
            .eq("id", prospect.id);

          // Log activity
          const activityLog: ActivityLog = {
            prospect_id: prospect.id,
            activity_type: "sequence_complete",
            description: `Sequence "${prospect.sequence_type}" completed at step ${prospect.sequence_step}`,
          };

          await db.from("acquisition_activities").insert(activityLog);

          continue;
        }

        // Send email via Resend
        const emailResponse = await sendEmail({
          to: prospect.owner_email!,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        // Log email sent
        const emailLog: EmailLog = {
          prospect_id: prospect.id,
          sequence_type: prospect.sequence_type,
          sequence_step: nextStep,
          subject: emailTemplate.subject,
          body_text: emailTemplate.text,
          body_html: emailTemplate.html,
          resend_id: emailResponse?.id ?? "",
          sent_at: new Date().toISOString(),
        };

        await db.from("acquisition_emails").insert(emailLog);

        // Log activity
        const activityLog: ActivityLog = {
          prospect_id: prospect.id,
          activity_type: "email_sent",
          description: `Email sent: ${emailTemplate.subject} (step ${nextStep})`,
          metadata: {
            resend_id: emailResponse?.id,
            sequence_type: prospect.sequence_type,
            step: nextStep,
          },
        };

        await db.from("acquisition_activities").insert(activityLog);

        // Calculate next email timing
        const nextDelay = getNextEmailDelay(
          prospect.sequence_type as AcquisitionProspect["sequence_type"],
          nextStep,
        );

        let nextEmailAt: string | null = null;
        let newStatus = prospect.status;

        if (nextDelay !== null) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + nextDelay);
          nextEmailAt = nextDate.toISOString();
        } else {
          // Sequence complete
          newStatus =
            prospect.sequence_type === "cold" ||
            prospect.sequence_type === "blast"
              ? "nurture"
              : prospect.status;
        }

        // Update prospect
        const updateData: Partial<AcquisitionProspectRow> = {
          sequence_step: nextStep,
          last_email_sent_at: new Date().toISOString(),
          next_email_at: nextEmailAt,
          status:
            prospect.status === "new" && newStatus === "new"
              ? "contacted"
              : newStatus,
        };

        const { error: updateError } = await db
          .from("acquisition_prospects")
          .update(updateData)
          .eq("id", prospect.id);

        if (updateError) {
          throw new Error(
            `Failed to update prospect ${prospect.id}: ${updateError.message}`,
          );
        }

        result.sent++;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        result.errors.push(`Prospect ${prospect.id}: ${errorMsg}`);

        // Log error activity
        try {
          const activityLog: ActivityLog = {
            prospect_id: prospect.id,
            activity_type: "error",
            description: `Email send failed: ${errorMsg}`,
          };

          await db.from("acquisition_activities").insert(activityLog);
        } catch {
          // Silently continue if activity log fails
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("Acquisition outreach cron error:", error);
    return NextResponse.json(
      {
        processed: 0,
        sent: 0,
        errors: [errorMsg],
      },
      { status: 500 },
    );
  }
}
