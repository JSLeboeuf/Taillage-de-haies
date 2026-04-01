import type { Env, TwilioWebhookBody, ConversationMessage, ClaudeResponse, ParsedAiResponse, ConversationState } from "./types";
import { QUALIFICATION_SYSTEM_PROMPT, OPT_OUT_CONFIRMATION, FALLBACK_RESPONSES } from "./prompts";
import { getConversation, updateConversation, updateCascadeResponse, getLeadByPhone, notifyHenri } from "./supabase";

const OPT_OUT_KEYWORDS = ["stop", "arret", "arrêt", "desinscrire", "désinscrire", "unsubscribe", "cancel"];
const HAIKU_MODEL = "claude-haiku-4-5-20251001";
const MAX_SMS_LENGTH = 155;
const MAX_TURNS = 8;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", timestamp: new Date().toISOString() });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (url.pathname === "/sms") {
      return handleIncomingSms(request, env);
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleIncomingSms(request: Request, env: Env): Promise<Response> {
  let body: TwilioWebhookBody;
  try {
    const formData = await request.formData();
    body = {
      From: (formData.get("From") as string) || "",
      To: (formData.get("To") as string) || "",
      Body: ((formData.get("Body") as string) || "").trim(),
      MessageSid: (formData.get("MessageSid") as string) || "",
    };
  } catch {
    return twimlResponse("");
  }

  if (!body.From || !body.Body) {
    return twimlResponse("");
  }

  const phone = body.From;
  const incomingText = body.Body;

  // Check opt-out
  if (isOptOut(incomingText)) {
    await handleOptOut(phone, env);
    return twimlResponse(OPT_OUT_CONFIRMATION);
  }

  // Get or find conversation
  const conversation = await getConversation(phone, env);

  if (!conversation) {
    // No active AI conversation — return empty TwiML
    // (let the Next.js webhook handle this message normally)
    return twimlResponse("");
  }

  // Skip if already completed/dead or max turns reached
  if (conversation.state === "completed" || conversation.state === "dead") {
    return twimlResponse("");
  }

  if (conversation.turn_count >= MAX_TURNS) {
    await updateConversation(conversation.id, { state: "handoff" }, env);
    const lead = await getLeadByPhone(phone, env);
    await notifyHenri(
      `🔔 Lead ${lead?.name || phone} a complete la qualification SMS (${conversation.qualification_score}/10). A contacter!`,
      env,
    );
    return twimlResponse(FALLBACK_RESPONSES.default);
  }

  // Mark cascade as responded
  await updateCascadeResponse(conversation.lead_id, env);

  // Add user message to history
  const messages: ConversationMessage[] = [
    ...conversation.messages,
    { role: "user", content: incomingText },
  ];

  // Call Claude Haiku
  let aiResponse: ParsedAiResponse;
  let tokenUsage = { input: 0, output: 0 };

  try {
    const result = await callClaude(messages, env);
    aiResponse = parseAiResponse(result.text);
    tokenUsage = { input: result.usage.input, output: result.usage.output };
  } catch (error) {
    console.error("Claude API error:", error);
    aiResponse = getFallbackResponse(incomingText);
    tokenUsage = { input: 0, output: 0 };
  }

  // Add assistant message to history
  messages.push({ role: "assistant", content: aiResponse.sms_text });

  // Calculate cost (Haiku: $0.80/M input, $4.00/M output)
  const costDelta =
    (tokenUsage.input * 0.8) / 1_000_000 +
    (tokenUsage.output * 4.0) / 1_000_000;

  // Update conversation in Supabase
  await updateConversation(
    conversation.id,
    {
      state: aiResponse.state,
      messages,
      qualification_score: aiResponse.score,
      turn_count: conversation.turn_count + 1,
      total_input_tokens: conversation.total_input_tokens + tokenUsage.input,
      total_output_tokens: conversation.total_output_tokens + tokenUsage.output,
      cost_usd: conversation.cost_usd + costDelta,
    },
    env,
  );

  // If score >= 8 or state is completed/handoff, notify Henri
  if (aiResponse.score >= 8 || aiResponse.state === "completed" || aiResponse.state === "handoff") {
    const lead = await getLeadByPhone(phone, env);
    await notifyHenri(
      `🔥 LEAD CHAUD! ${lead?.name || phone} — Score: ${aiResponse.score}/10. Qualification SMS terminee. Appeler ASAP!`,
      env,
    );
  }

  // If state is dead (not interested), mark conversation
  if (aiResponse.state === "dead") {
    await updateConversation(conversation.id, { state: "dead" }, env);
  }

  return twimlResponse(aiResponse.sms_text);
}

async function callClaude(
  messages: ConversationMessage[],
  env: Env,
): Promise<{ text: string; usage: { input: number; output: number } }> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
    },
    body: JSON.stringify({
      model: HAIKU_MODEL,
      max_tokens: 200,
      system: QUALIFICATION_SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as ClaudeResponse;
  const textBlock = data.content.find((c) => c.type === "text");
  const text = textBlock?.text || "";

  return {
    text,
    usage: {
      input: data.usage.input_tokens,
      output: data.usage.output_tokens,
    },
  };
}

function parseAiResponse(raw: string): ParsedAiResponse {
  // Extract metadata line: [score:X|state:STATE]
  const metadataMatch = raw.match(/\[score:(\d+)\|state:(\w+)\]/);

  let score = 3;
  let state: ConversationState = "qualifying";

  if (metadataMatch) {
    score = Math.min(10, Math.max(0, parseInt(metadataMatch[1], 10)));
    const rawState = metadataMatch[2] as ConversationState;
    const validStates: ConversationState[] = ["greeting", "qualifying", "scheduling", "handoff", "completed", "dead"];
    if (validStates.includes(rawState)) {
      state = rawState;
    }
  }

  // Extract SMS text (everything before the metadata line)
  let smsText = raw
    .replace(/\[score:\d+\|state:\w+\]/, "")
    .trim();

  // Enforce SMS length limit
  if (smsText.length > MAX_SMS_LENGTH) {
    smsText = smsText.substring(0, MAX_SMS_LENGTH - 3) + "...";
  }

  return { sms_text: smsText, score, state };
}

function isOptOut(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return OPT_OUT_KEYWORDS.some((kw) => lower === kw || lower.startsWith(kw));
}

async function handleOptOut(phone: string, env: Env): Promise<void> {
  const conversation = await getConversation(phone, env);
  if (conversation) {
    await updateConversation(conversation.id, { opt_out: true, state: "dead" }, env);
  }
}

function getFallbackResponse(incomingText: string): ParsedAiResponse {
  const lower = incomingText.toLowerCase();

  if (lower.includes("oui") || lower.includes("yes") || lower.includes("correct")) {
    return { sms_text: FALLBACK_RESPONSES.positive, score: 4, state: "qualifying" };
  }
  if (lower.includes("non") || lower.includes("no") || lower.includes("pas interesse")) {
    return { sms_text: FALLBACK_RESPONSES.negative, score: 1, state: "dead" };
  }

  return { sms_text: FALLBACK_RESPONSES.unclear, score: 3, state: "qualifying" };
}

function twimlResponse(message: string): Response {
  const xml = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`;

  return new Response(xml, {
    headers: { "Content-Type": "text/xml" },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
