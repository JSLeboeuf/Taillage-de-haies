import type { Env, SmsConversation, ConversationMessage, QualificationData, ConversationState } from "./types";

export async function getConversation(
  phone: string,
  env: Env,
): Promise<SmsConversation | null> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/sms_conversations?phone_number=eq.${encodeURIComponent(phone)}&state=not.in.(dead,completed)&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  const data = await res.json() as SmsConversation[];
  return data.length > 0 ? data[0] : null;
}

export async function createConversation(
  leadId: string,
  phone: string,
  env: Env,
): Promise<SmsConversation> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/sms_conversations`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      lead_id: leadId,
      phone_number: phone,
      state: "greeting",
      messages: [],
      qualification_data: {},
      consent_sms: true,
    }),
  });
  const data = await res.json() as SmsConversation[];
  return data[0];
}

export async function updateConversation(
  id: string,
  updates: {
    state?: ConversationState;
    messages?: ConversationMessage[];
    qualification_data?: QualificationData;
    qualification_score?: number;
    turn_count?: number;
    total_input_tokens?: number;
    total_output_tokens?: number;
    cost_usd?: number;
    opt_out?: boolean;
  },
  env: Env,
): Promise<void> {
  await fetch(
    `${env.SUPABASE_URL}/rest/v1/sms_conversations?id=eq.${id}`,
    {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    },
  );
}

export async function updateCascadeResponse(
  leadId: string,
  env: Env,
): Promise<void> {
  await fetch(
    `${env.SUPABASE_URL}/rest/v1/cascade_tracking?lead_id=eq.${leadId}`,
    {
      method: "PATCH",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tier1_sms_responded: true,
      }),
    },
  );
}

export async function getLeadByPhone(
  phone: string,
  env: Env,
): Promise<{ id: string; name: string } | null> {
  const res = await fetch(
    `${env.SUPABASE_URL}/rest/v1/leads?phone=eq.${encodeURIComponent(phone)}&order=created_at.desc&limit=1&select=id,name`,
    {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
    },
  );
  const data = await res.json() as Array<{ id: string; name: string }>;
  return data.length > 0 ? data[0] : null;
}

export async function notifyHenri(
  message: string,
  env: Env,
): Promise<void> {
  const henriPhone = env.HENRI_PHONE;
  if (!henriPhone) return;

  const params = new URLSearchParams({
    To: henriPhone,
    From: env.TWILIO_PHONE_NUMBER,
    Body: message,
  });

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );
}
