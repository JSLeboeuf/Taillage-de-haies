import { Twilio } from 'twilio';

interface AvailableSlot {
  date: string;
  time: string;
  label: string;
}

interface AvailableSlotsResponse {
  slots: AvailableSlot[];
}

interface BookAppointmentParams {
  clientName: string;
  phone: string;
  address: string;
  city: string;
  hedgeType: string;
  hedgeSides: number;
  hedgeHeight: string;
  selectedSlot: {
    date: string;
    time: string;
  };
  notes?: string;
}

interface BookAppointmentResponse {
  success: boolean;
  jobId: string;
  estimatedAmount: number;
  confirmationMessage: string;
}

interface SendSMSParams {
  to: string;
  message: string;
}

interface SendSMSResponse {
  sent: boolean;
  sid: string;
}

interface TransferCallParams {
  reason: 'angry_client' | 'complex_quote' | 'emergency' | 'commercial' | 'escalation';
  destination?: string;
}

interface TransferCallResponse {
  transfer: boolean;
  destination: string;
  message: string;
}

// VAPI webhook types — matches official docs + Milette prod handler
interface VAPIToolCall {
  id: string;
  name?: string;
  function?: { name: string; arguments: string };
  parameters?: Record<string, unknown>;
}

interface VAPIToolWithToolCall {
  name?: string;
  toolCall: VAPIToolCall;
}

interface VAPIRequest {
  message: {
    type: string;
    // Legacy format (function-call)
    functionCall?: {
      name: string;
      parameters: Record<string, unknown>;
    };
    // Modern format (tool-calls) — official VAPI docs
    toolCallList?: VAPIToolCall[];
    toolWithToolCallList?: VAPIToolWithToolCall[];
    toolCalls?: VAPIToolCall[];
  };
}

// Utility: Generate available slots
function generateAvailableSlots(
  preferredDate?: string,
  preferredTime?: string
): AvailableSlot[] {
  const now = new Date();
  const slots: AvailableSlot[] = [];

  let startDate = preferredDate ? new Date(preferredDate) : new Date(now);

  // If no date specified, start from tomorrow
  if (!preferredDate) {
    startDate.setDate(now.getDate() + 1);
  }

  // Skip to next weekday if weekend
  while (startDate.getDay() === 0 || startDate.getDay() === 6) {
    startDate.setDate(startDate.getDate() + 1);
  }

  const times = preferredTime ? [preferredTime] : ['10:00', '13:00', '15:00'];
  const dayNames = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
  const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aoû', 'sep', 'oct', 'nov', 'déc'];

  for (let i = 0; i < 3; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    // Skip weekends
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;

    for (const time of times) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = dayNames[currentDate.getDay()];
      const day = currentDate.getDate();
      const month = monthNames[currentDate.getMonth()];

      slots.push({
        date: dateStr,
        time,
        label: `${dayName} ${day} ${month} à ${time}`,
      });

      if (slots.length >= 3) break;
    }

    if (slots.length >= 3) break;
  }

  return slots;
}

// Utility: Calculate estimated quote
function calculateEstimate(
  hedgeType: string,
  hedgeSides: number,
  hedgeHeight: string
): number {
  // Base rate per side per meter (labour + equipment)
  const baseRates: Record<string, number> = {
    cèdre: 12.5,
    feuillue: 14.0,
    mixte: 13.0,
    'cèdre-persistant': 12.5,
    autre: 13.0,
  };
  const baseRate = baseRates[hedgeType] || 13.0;

  const standardLength = 8; // meters per side

  // Height multiplier (affects difficulty and time)
  const heightMultipliers: Record<string, number> = {
    basse: 1.0,
    moyenne: 1.4,
    haute: 1.8,
    'très-haute': 2.2,
  };
  const heightMult = heightMultipliers[hedgeHeight] || 1.4;

  // Calculate cost per side (with discount for multiple sides)
  let sidesCost = 0;
  for (let i = 0; i < hedgeSides; i++) {
    sidesCost += baseRate * standardLength * (i === 0 ? 1.0 : 0.65);
  }

  let estimate = sidesCost * heightMult;

  // Top trimming: +20%
  estimate *= 1.2;

  // Cleanup & removal: +15%
  estimate *= 1.15;

  // Minimum $250
  estimate = Math.max(estimate, 250);

  // Round to nearest $5
  estimate = Math.round(estimate / 5) * 5;

  return estimate;
}

// Utility: Validate Quebec phone number
function isValidQuebecPhone(phone: string): boolean {
  // Remove formatting
  const cleaned = phone.replace(/\D/g, '');

  // Must be 10 digits and start with valid Quebec area codes
  if (cleaned.length !== 10) return false;

  const areaCode = cleaned.substring(0, 3);
  const validAreaCodes = ['514', '438', '450', '579', '819', '873', '418', '581', '367'];

  return validAreaCodes.includes(areaCode);
}

// Utility: Format phone for SMS
function formatPhoneForSMS(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `+1${cleaned}`;
}

// Tool: availableSlots
async function handleAvailableSlots(
  params: Record<string, unknown>
): Promise<AvailableSlotsResponse> {
  const preferredDate = params.preferredDate as string | undefined;
  const preferredTime = params.preferredTime as string | undefined;

  const slots = generateAvailableSlots(preferredDate, preferredTime);

  return {
    slots,
  };
}

// Tool: bookAppointment
async function handleBookAppointment(
  params: Record<string, unknown>
): Promise<BookAppointmentResponse> {
  const p = params as unknown as BookAppointmentParams;

  // Validate phone
  if (!isValidQuebecPhone(p.phone)) {
    throw new Error(`Invalid Quebec phone number: ${p.phone}`);
  }

  // Calculate estimate
  const estimatedAmount = calculateEstimate(p.hedgeType, p.hedgeSides, p.hedgeHeight);

  // Generate job ID (in production: would call ServiceM8 API)
  const jobId = `JOB-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

  const confirmationMessage = `
Confirmation de RDV:
- Nom: ${p.clientName}
- Adresse: ${p.address}, ${p.city}
- Date: ${p.selectedSlot.date} à ${p.selectedSlot.time}
- Type de haie: ${p.hedgeType}
- Côtés: ${p.hedgeSides}
- Estimation: $${estimatedAmount}
${p.notes ? `- Notes: ${p.notes}` : ''}
  `.trim();

  console.log('[bookAppointment]', {
    jobId,
    clientName: p.clientName,
    phone: p.phone,
    address: p.address,
    city: p.city,
    hedgeType: p.hedgeType,
    hedgeSides: p.hedgeSides,
    hedgeHeight: p.hedgeHeight,
    slot: p.selectedSlot,
    estimatedAmount,
    notes: p.notes,
  });

  // In production: call ServiceM8 API to create company + job
  // await servicem8.createCompany({ name, phone, email });
  // await servicem8.createJob({ companyId, address, jobType, notes });

  return {
    success: true,
    jobId,
    estimatedAmount,
    confirmationMessage,
  };
}

// Tool: sendSMS
async function handleSendSMS(
  params: Record<string, unknown>,
  env: CloudflareEnv
): Promise<SendSMSResponse> {
  const p = params as unknown as SendSMSParams;

  // Validate phone
  if (!isValidQuebecPhone(p.to)) {
    throw new Error(`Invalid Quebec phone number: ${p.to}`);
  }

  // In production: call Twilio API
  if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
    const client = new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

    try {
      const message = await client.messages.create({
        body: p.message,
        from: env.TWILIO_PHONE_NUMBER,
        to: formatPhoneForSMS(p.to),
      });

      console.log('[sendSMS] Message sent:', message.sid);
      return {
        sent: true,
        sid: message.sid,
      };
    } catch (error) {
      console.error('[sendSMS] Error:', error);
      throw error;
    }
  } else {
    // Mock mode for testing
    const mockSid = `SM-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    console.log('[sendSMS] (mock)', {
      to: p.to,
      message: p.message,
      sid: mockSid,
    });

    return {
      sent: true,
      sid: mockSid,
    };
  }
}

// Tool: transferCall
async function handleTransferCall(
  params: Record<string, unknown>
): Promise<TransferCallResponse> {
  const p = params as unknown as TransferCallParams;
  const destination = p.destination || '+1-514-813-8957'; // Henri's number

  console.log('[transferCall]', {
    reason: p.reason,
    destination,
  });

  return {
    transfer: true,
    destination,
    message: `Transferring to Henri for ${p.reason}`,
  };
}

// Execute a single tool call by name
async function executeTool(
  name: string,
  params: Record<string, unknown>,
  env: CloudflareEnv
): Promise<unknown> {
  switch (name) {
    case 'availableSlots':
      return handleAvailableSlots(params);
    case 'bookAppointment':
      return handleBookAppointment(params);
    case 'sendSMS':
      return handleSendSMS(params, env);
    case 'transferCall':
      return handleTransferCall(params);
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}

// Extract tool calls from VAPI payload (supports both legacy + modern formats)
function extractToolCalls(message: VAPIRequest['message']): Array<{ id: string; name: string; params: Record<string, unknown> }> {
  const calls: Array<{ id: string; name: string; params: Record<string, unknown> }> = [];

  // Modern format: tool-calls with toolCallList (official VAPI docs)
  const rawList = message.toolCallList || message.toolCalls || [];
  if (rawList.length > 0) {
    for (const tc of rawList) {
      const name = tc.name || tc.function?.name || '';
      const params = tc.parameters || (tc.function?.arguments ? JSON.parse(tc.function.arguments) : {});
      calls.push({ id: tc.id, name, params });
    }
    return calls;
  }

  // Modern format: toolWithToolCallList
  if (message.toolWithToolCallList && message.toolWithToolCallList.length > 0) {
    for (const item of message.toolWithToolCallList) {
      const tc = item.toolCall;
      const name = item.name || tc.name || tc.function?.name || '';
      const params = tc.parameters || (tc.function?.arguments ? JSON.parse(tc.function.arguments) : {});
      calls.push({ id: tc.id, name, params });
    }
    return calls;
  }

  // Legacy format: function-call with functionCall
  if (message.functionCall) {
    calls.push({
      id: `legacy-${Date.now()}`,
      name: message.functionCall.name,
      params: message.functionCall.parameters,
    });
  }

  return calls;
}

// Main webhook handler — supports both legacy (function-call) and modern (tool-calls) VAPI formats
export async function handleVAPIWebhook(
  request: Request,
  env: CloudflareEnv
): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = (await request.json()) as VAPIRequest;
    const msgType = payload.message.type;

    // Only handle function-call and tool-calls events
    if (msgType !== 'function-call' && msgType !== 'tool-calls') {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const toolCalls = extractToolCalls(payload.message);

    if (toolCalls.length === 0) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process all tool calls and build results array (VAPI official format)
    const results: Array<{ toolCallId: string; name?: string; result: string }> = [];

    for (const tc of toolCalls) {
      try {
        const toolResult = await executeTool(tc.name, tc.params, env);
        results.push({
          toolCallId: tc.id,
          name: tc.name,
          result: JSON.stringify(toolResult),
        });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[webhook] Tool ${tc.name} error:`, errMsg);
        results.push({
          toolCallId: tc.id,
          name: tc.name,
          result: JSON.stringify({ error: errMsg }),
        });
      }
    }

    // Return in VAPI official format: { results: [{ toolCallId, result }] }
    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[webhook] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Types for Cloudflare Worker environment
interface CloudflareEnv {
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_PHONE_NUMBER?: string;
  SERVICEM8_TOKEN?: string;
  ENVIRONMENT?: string;
}

export type { CloudflareEnv, VAPIRequest };
