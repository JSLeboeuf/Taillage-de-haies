export interface Env {
  ANTHROPIC_API_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_PHONE_NUMBER: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  HENRI_PHONE?: string;
}

export type ConversationState =
  | "greeting"
  | "qualifying"
  | "scheduling"
  | "handoff"
  | "completed"
  | "dead";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface QualificationData {
  is_owner?: boolean;
  hedge_sides?: number;
  hedge_type?: string;
  city?: string;
  availability?: string;
  estimated_sqft?: number;
  estimated_price?: number;
}

export interface SmsConversation {
  id: string;
  lead_id: string;
  phone_number: string;
  state: ConversationState;
  messages: ConversationMessage[];
  qualification_data: QualificationData;
  qualification_score: number;
  turn_count: number;
  total_input_tokens: number;
  total_output_tokens: number;
  cost_usd: number;
  opt_out: boolean;
}

export interface ClaudeResponse {
  content: Array<{ type: string; text?: string }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
  };
}

export interface ParsedAiResponse {
  sms_text: string;
  score: number;
  state: ConversationState;
}

export interface TwilioWebhookBody {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
}
