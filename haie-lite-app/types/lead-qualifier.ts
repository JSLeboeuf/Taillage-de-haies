/**
 * AI Lead Qualifier — Type Definitions
 * SMS AI qualification, cascade tracking, appointments, calls, WhatsApp
 */

// ============================================================================
// Conversation State Machine
// ============================================================================

export type ConversationState =
  | "greeting"
  | "qualifying"
  | "scheduling"
  | "handoff"
  | "completed"
  | "dead";

export type CascadeTier = 1 | 2 | 3 | 4;

export type CascadeOutcome =
  | "qualified"
  | "appointment_booked"
  | "not_interested"
  | "wrong_number"
  | "no_response"
  | "disqualified";

export type AppointmentSource = "sms_ai" | "vapi_call" | "whatsapp" | "manual";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type WhatsAppDirection = "inbound" | "outbound";

export type WhatsAppMessageType = "text" | "template" | "image" | "document";

// ============================================================================
// SMS Conversation (AI Qualification)
// ============================================================================

export interface SmsConversation {
  id: string;
  lead_id: string;
  phone_number: string;
  state: ConversationState;
  messages: ConversationMessage[];
  qualification_data: QualificationData;
  qualification_score: number;
  turn_count: number;
  ai_model: string;
  total_input_tokens: number;
  total_output_tokens: number;
  cost_usd: number;
  consent_sms: boolean;
  opt_out: boolean;
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export interface QualificationData {
  is_owner?: boolean;
  hedge_sides?: number;
  hedge_height_ft?: number;
  hedge_length_ft?: number;
  hedge_type?: "cedre" | "feuillue" | "mixte" | "autre";
  city?: string;
  service_type?: "taille" | "rabattage" | "entretien" | "autre";
  availability?: string;
  budget_range?: string;
  urgency?: "urgent" | "this_season" | "next_year" | "exploring";
  estimated_sqft?: number;
  estimated_price?: number;
}

// ============================================================================
// Cascade Tracking
// ============================================================================

export interface CascadeTracking {
  id: string;
  lead_id: string;
  current_tier: CascadeTier;
  tier1_sms_sent_at: string | null;
  tier1_sms_responded: boolean;
  tier1_completed_at: string | null;
  tier2_call_sent_at: string | null;
  tier2_call_answered: boolean;
  tier2_call_id: string | null;
  tier2_completed_at: string | null;
  tier3_whatsapp_sent_at: string | null;
  tier3_whatsapp_responded: boolean;
  tier3_completed_at: string | null;
  tier4_email_started_at: string | null;
  tier4_email_step: number;
  tier4_completed_at: string | null;
  final_outcome: CascadeOutcome | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Appointments
// ============================================================================

export interface Appointment {
  id: string;
  lead_id: string;
  scheduled_date: string;
  scheduled_time_slot: string;
  address: string | null;
  notes: string | null;
  source: AppointmentSource;
  status: AppointmentStatus;
  servicem8_job_uuid: string | null;
  reminder_sent: boolean;
  created_at: string;
}

// ============================================================================
// Call Results (VAPI)
// ============================================================================

export interface CallResult {
  id: string;
  lead_id: string;
  vapi_call_id: string;
  phone_number: string;
  duration_seconds: number | null;
  status: string;
  transcript: string | null;
  analysis: CallAnalysis | null;
  qualification_score: number | null;
  sentiment: string | null;
  next_steps: string[] | null;
  recording_url: string | null;
  cost_usd: number | null;
  created_at: string;
}

export interface CallAnalysis {
  summary: string;
  sentiment: string;
  qualification_score: number;
  next_steps: string[];
  qualification_criteria?: {
    interest: boolean;
    budget: string;
    timeline: string;
    decision_maker: boolean;
  };
}

// ============================================================================
// WhatsApp Messages
// ============================================================================

export interface WhatsAppMessage {
  id: string;
  lead_id: string;
  phone_number: string;
  direction: WhatsAppDirection;
  message_type: WhatsAppMessageType;
  content: string | null;
  template_name: string | null;
  wa_message_id: string | null;
  status: string;
  created_at: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface SmsWebhookPayload {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
  NumMedia?: string;
  AccountSid?: string;
}

export interface ClaudeApiRequest {
  model: string;
  max_tokens: number;
  system:
    | string
    | Array<{ type: string; text: string; cache_control?: { type: string } }>;
  messages: ConversationMessage[];
  tools?: ClaudeTool[];
}

export interface ClaudeTool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface ClaudeApiResponse {
  content: Array<
    | { type: "text"; text: string }
    | {
        type: "tool_use";
        id: string;
        name: string;
        input: Record<string, unknown>;
      }
  >;
  stop_reason: "end_turn" | "tool_use" | "max_tokens";
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

export interface SmsAiResponse {
  sms_text: string;
  metadata: {
    score: number;
    state: ConversationState;
    qualification_complete: boolean;
  };
}

// ============================================================================
// VAPI Outbound Call
// ============================================================================

export interface VapiOutboundCallRequest {
  phoneNumber: string;
  assistantId: string;
  assistantOverrides?: {
    variableValues?: Record<string, string>;
    model?: {
      messages?: Array<{ role: string; content: string }>;
    };
  };
}

export interface VapiCallResponse {
  id: string;
  status: string;
  phoneNumber: string;
  startedAt?: string;
}

export interface VapiWebhookEvent {
  event:
    | "call-ended"
    | "end-of-call-report"
    | "analysis-ready"
    | "recording-ready";
  callId: string;
  phoneNumber?: string;
  duration?: number;
  status?: string;
  transcript?: string;
  analysis?: CallAnalysis;
  recordingUrl?: string;
  timestamp?: string;
}

// ============================================================================
// Cascade Escalation
// ============================================================================

export interface EscalationAction {
  lead_id: string;
  from_tier: CascadeTier;
  to_tier: CascadeTier;
  action: "vapi_call" | "whatsapp_template" | "email_sequence";
  phone_number: string;
  lead_name: string;
  context: Record<string, unknown>;
}

// ============================================================================
// Dashboard Stats
// ============================================================================

export interface LeadQualifierStats {
  total_leads_today: number;
  total_leads_week: number;
  avg_qualification_score: number;
  avg_response_time_seconds: number;
  conversion_rate: number;
  cpql: number;
  tier_distribution: Record<CascadeTier, number>;
  outcome_distribution: Record<CascadeOutcome, number>;
  appointments_pending: number;
  appointments_this_week: number;
}
