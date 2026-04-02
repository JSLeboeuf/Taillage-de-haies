export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import {
  createLead,
  getLeadByPhone,
  logMessageSent,
  supabaseAdmin,
} from "@/lib/supabase";
import { servicem8 } from "@/lib/servicem8";
import { sendSMS, formatPhoneQC, isValidQCPhone } from "@/lib/twilio";
import { extractLeadInfo } from "@/lib/openai";
import { calculateQuote, quickEstimate } from "@/lib/quotes";
import { SMS } from "@/lib/sms-templates";

// CASL-compliant first SMS for AI qualification
const GREETING_SMS = (firstName: string): string =>
  `Bonjour ${firstName}! C'est Sophie de Haie Lite. Merci pour ta demande! T'es proprietaire de la maison? STOP pour se desinscrire.`;

export async function POST(request: NextRequest) {
  try {
    // Validate X-Hub-Signature-256
    const signature = request.headers.get("x-hub-signature-256");
    if (process.env.META_APP_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 403 });
      }
      const rawBody = await request.clone().text();
      const isValid = await verifyMetaSignature(
        rawBody,
        signature,
        process.env.META_APP_SECRET,
      );
      if (!isValid) {
        console.error("Invalid Meta webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 403 },
        );
      }
    }

    const body = await request.json();

    // Meta Lead Form webhook format
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const leadData = change?.value;

    if (!leadData) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    // Extract field data from Meta Lead Form
    const fields: Record<string, string> = {};
    for (const field of leadData.field_data || []) {
      fields[field.name] = Array.isArray(field.values)
        ? field.values[0]
        : field.values;
    }

    const name =
      `${fields.first_name || ""} ${fields.last_name || ""}`.trim() ||
      fields.full_name ||
      "Inconnu";
    const firstName = fields.first_name || name.split(" ")[0] || "ami";
    const phone = fields.phone_number || fields.phone || "";
    const email = fields.email || "";
    const city = fields.city || "";
    const hedgeSides =
      parseInt(fields.hedge_sides || fields.nombre_cotes || "0") || null;
    const notes = fields.comments || fields.notes || "";
    const consentSms =
      fields.sms_consent === "true" || fields.sms_consent === "1" || fields.sms_consent === undefined; // CASL: true if consent given or field absent (implicit from lead form opt-in)

    if (!phone || !isValidQCPhone(phone)) {
      console.error("Invalid phone number from Meta lead:", phone);
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }

    const formattedPhone = formatPhoneQC(phone);

    // Check for duplicate lead (same phone in last 24h)
    const existing = await getLeadByPhone(formattedPhone);
    if (existing && isRecent(existing.created_at, 24)) {
      return NextResponse.json({ status: "duplicate", lead_id: existing.id });
    }

    // Calculate quick estimate if we have sides info
    let estimatedAmount: number | null = null;
    if (hedgeSides) {
      const quote = quickEstimate(hedgeSides, true);
      estimatedAmount = quote.totalWithTax;
    }

    // Create lead in Supabase
    const lead = await createLead({
      name,
      phone: formattedPhone,
      email: email || undefined,
      city: city || undefined,
      source: "meta_ads",
      hedge_sides: hedgeSides || undefined,
      notes: notes || undefined,
    });

    // Create SMS conversation for AI qualification
    const { error: convError } = await supabaseAdmin
      .from("sms_conversations")
      .insert({
        lead_id: lead.id,
        phone_number: formattedPhone,
        state: "greeting",
        messages: [],
        qualification_data: {
          hedge_sides: hedgeSides,
          city: city || undefined,
        },
        consent_sms: consentSms,
      });

    if (convError) {
      console.error("Failed to create sms_conversation:", convError);
    }

    // Create cascade tracking entry
    await supabaseAdmin.from("cascade_tracking").insert({
      lead_id: lead.id,
      current_tier: 1,
      tier1_sms_sent_at: new Date().toISOString(),
    });

    // Create company + job in ServiceM8
    const company = await servicem8.createCompany({
      name,
      address_city: city,
      address_state: "QC",
      address_country: "Canada",
    });

    await servicem8.createContact({
      company_uuid: company.uuid,
      first: name.split(" ")[0],
      last: name.split(" ").slice(1).join(" "),
      mobile: formattedPhone,
      email,
    });

    const jobDescription = hedgeSides
      ? `Taille de haie ${hedgeSides} côtés + top incluant ramassage (Meta Lead)`
      : `Taille de haie — demande via Meta Ads`;

    await servicem8.createJob({
      company_uuid: company.uuid,
      status: "Quote",
      description: jobDescription + (notes ? `\n${notes}` : ""),
      job_is_quoted: "1",
    });

    // Send AI qualification greeting SMS (CASL-compliant, <30s from lead)
    const greetingSms = GREETING_SMS(firstName);
    await sendSMS(formattedPhone, greetingSms);
    await logMessageSent({
      lead_id: lead.id,
      channel: "sms",
      type: "ai_qualification",
      content: greetingSms,
      recipient_phone: formattedPhone,
    });

    // Update conversation with greeting message
    await supabaseAdmin
      .from("sms_conversations")
      .update({
        messages: [{ role: "assistant", content: greetingSms }],
        state: "qualifying",
        turn_count: 1,
      })
      .eq("lead_id", lead.id)
      .neq("state", "dead");

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      estimated_amount: estimatedAmount,
      ai_sms_sent: true,
    });
  } catch (error) {
    console.error("Meta leads webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function verifyMetaSignature(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
    const expectedSignature =
      "sha256=" +
      Array.from(new Uint8Array(sig))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

// Meta webhook verification (GET for challenge)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

function isRecent(dateStr: string, hours: number): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return now.getTime() - date.getTime() < hours * 60 * 60 * 1000;
}
