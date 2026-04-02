export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendSMS } from "@/lib/twilio";

const CRON_SECRET = process.env.CRON_SECRET;
const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_SOPHIE_ASSISTANT_ID =
  process.env.VAPI_SOPHIE_ASSISTANT_ID ||
  "713bba6b-5d60-4ece-90c1-5bce3ec41a5c";

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    escalated_to_tier2: 0,
    escalated_to_tier3: 0,
    escalated_to_tier4: 0,
    errors: [] as string[],
  };

  try {
    // Call the escalate_cascade() SQL function
    const { data: escalations, error } =
      await supabaseAdmin.rpc("escalate_cascade");

    if (error) {
      console.error("Escalation function error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!escalations || escalations.length === 0) {
      return NextResponse.json({
        message: "No escalations needed",
        ...results,
      });
    }

    // Process each escalation
    for (const esc of escalations as Array<{
      lead_id: string;
      from_tier: number;
      to_tier: number;
    }>) {
      try {
        // Get lead details
        const { data: lead } = await supabaseAdmin
          .from("leads")
          .select("id, name, phone, city, hedge_sides")
          .eq("id", esc.lead_id)
          .single();

        if (!lead) continue;

        if (esc.to_tier === 2) {
          // Tier 2: Trigger VAPI outbound call
          await triggerVapiCall(lead);
          results.escalated_to_tier2++;
        } else if (esc.to_tier === 3) {
          // Tier 3: Send WhatsApp template (placeholder — SMS fallback for now)
          await sendTier3Fallback(lead);
          results.escalated_to_tier3++;
        } else if (esc.to_tier === 4) {
          // Tier 4: Start email nurture (placeholder)
          await startEmailNurture(lead);
          results.escalated_to_tier4++;
        }
      } catch (escError) {
        const msg = `Error escalating lead ${esc.lead_id} to tier ${esc.to_tier}: ${escError}`;
        console.error(msg);
        results.errors.push(msg);
      }
    }

    return NextResponse.json({
      message: `Processed ${escalations.length} escalations`,
      ...results,
    });
  } catch (error) {
    console.error("Cascade escalation cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function triggerVapiCall(lead: {
  id: string;
  name: string;
  phone: string;
  city?: string;
  hedge_sides?: number;
}): Promise<void> {
  if (!VAPI_API_KEY) {
    console.error("VAPI_API_KEY not set, skipping call");
    return;
  }

  const firstName = lead.name?.split(" ")[0] || "";

  const response = await fetch("https://api.vapi.ai/call", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber: lead.phone,
      assistantId: VAPI_SOPHIE_ASSISTANT_ID,
      assistantOverrides: {
        variableValues: {
          firstName,
          lastName: lead.name?.split(" ").slice(1).join(" ") || "",
          city: lead.city || "",
          hedgeSides: String(lead.hedge_sides || ""),
          smsContext: "Le prospect n'a pas repondu aux SMS de qualification",
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`VAPI call failed: ${response.status} ${errorText}`);
  }

  const callData = (await response.json()) as { id: string };

  // Update cascade tracking with call info
  await supabaseAdmin
    .from("cascade_tracking")
    .update({
      tier2_call_sent_at: new Date().toISOString(),
      tier2_call_id: callData.id,
    })
    .eq("lead_id", lead.id);
}

async function sendTier3Fallback(lead: {
  id: string;
  name: string;
  phone: string;
}): Promise<void> {
  // WhatsApp not yet configured — use SMS as fallback
  const firstName = lead.name?.split(" ")[0] || "";
  const message = `Bonjour ${firstName}! C'est Haie Lite. On a essaye de vous joindre pour votre soumission gratuite de taillage de haies. Interessé? Repondez OUI! STOP pour se desinscrire.`;

  await sendSMS(lead.phone, message);

  await supabaseAdmin
    .from("cascade_tracking")
    .update({
      tier3_whatsapp_sent_at: new Date().toISOString(),
    })
    .eq("lead_id", lead.id);
}

async function startEmailNurture(lead: {
  id: string;
  name: string;
}): Promise<void> {
  // Email nurture — Phase 3 implementation
  // For now, just mark the tier4 start
  await supabaseAdmin
    .from("cascade_tracking")
    .update({
      tier4_email_started_at: new Date().toISOString(),
      tier4_email_step: 1,
    })
    .eq("lead_id", lead.id);

  console.log(`Email nurture started for lead ${lead.id} (${lead.name})`);
}
