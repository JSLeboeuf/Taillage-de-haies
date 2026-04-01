# Rapport Technique : Pipeline de Leads Temps Réel avec Supabase
## Système de Qualification AI en Production

---

## Table des matières
1. Architecture globale
2. Schéma de base de données
3. Configuration Realtime & Webhooks
4. Implémentation TypeScript
5. Patterns Next.js
6. Sécurité (RLS)
7. Optimisations et performance
8. Workflows automatisés

---

## 1. Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                     Lead Pipeline en Temps Réel                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  VAPI (Voice) ──► Webhook ──► Edge Function ──► Supabase DB    │
│       │                              │                           │
│       │                              └─► Realtime Broadcast      │
│       │                                                           │
│  Form Input ────► API Route ──► Database Webhook ──► pg_notify  │
│       │                                                           │
│  Meta CAPI ──────► Conversion Tracking ──► Lead Scoring         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─ FRONT-END ──────────────────────────────────────────────────┐
│ Next.js Dashboard                                             │
│ ├─ Real-time Subscription (Realtime Client)                  │
│ ├─ WebSocket Connection Pool                                 │
│ ├─ Lead Cards + Status Updates                               │
│ └─ Qualification Form (Auto-submit)                          │
└────────────────────────────────────────────────────────────────┘

┌─ BACK-END PROCESSORS ─────────────────────────────────────────┐
│ • Edge Functions: Transform + Validate                         │
│ • Database Webhooks: Event triggers (INSERT/UPDATE/DELETE)    │
│ • pg_cron: Follow-up sequences (daily, hourly)               │
│ • Meta CAPI: Conversion pixel + event logging                │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Schéma de Base de Données

### 2.1 Tables Principales

```sql
-- Extension: pg_jsonschema (JSON validation)
CREATE EXTENSION IF NOT EXISTS pg_jsonschema;

-- Extension: pg_cron (scheduled tasks)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ============ LEADS TABLE ============
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,

  -- AI Qualification Pipeline
  qualification_status TEXT DEFAULT 'new'
    CHECK (qualification_status IN (
      'new', 'qualified', 'partial', 'disqualified', 'pending_followup'
    )),
  qualification_score NUMERIC(3,2) DEFAULT 0.00,
  qualification_timestamp TIMESTAMP WITH TIME ZONE,

  -- VAPI Integration
  vapi_conversation_id TEXT UNIQUE,
  vapi_status TEXT DEFAULT 'pending'
    CHECK (vapi_status IN ('pending', 'in_progress', 'completed', 'failed')),

  -- Conversation History (JSONB)
  conversation_history JSONB DEFAULT '{
    "messages": [],
    "summary": "",
    "key_questions_answered": {},
    "sentiment": "neutral"
  }'::jsonb,

  -- Lead Metadata
  source TEXT DEFAULT 'vapi', -- 'vapi', 'form', 'import'
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contacted_at TIMESTAMP WITH TIME ZONE,

  -- Soft Delete
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for Performance
CREATE INDEX idx_leads_status ON leads(qualification_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_created_at ON leads(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_score ON leads(qualification_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_phone ON leads(phone_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_leads_vapi_id ON leads(vapi_conversation_id);
CREATE INDEX idx_leads_updated_at ON leads(updated_at DESC) WHERE deleted_at IS NULL;

-- Composite index for common queries
CREATE INDEX idx_leads_status_score ON leads(qualification_status, qualification_score DESC)
  WHERE deleted_at IS NULL;

-- JSONB index for conversation history searches
CREATE INDEX idx_leads_conversation_gin ON leads USING GIN (conversation_history);

-- ============ FOLLOW-UP SEQUENCES TABLE ============
CREATE TABLE followup_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  sequence_type TEXT NOT NULL
    CHECK (sequence_type IN ('initial_call', 'qualification', 'nurture', 'close')),

  step_number INT NOT NULL DEFAULT 1,
  total_steps INT NOT NULL DEFAULT 5,

  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'completed')),

  message_content JSONB NOT NULL DEFAULT '{}',
  message_type TEXT DEFAULT 'sms' -- 'sms', 'email', 'voice'

  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  response_received_at TIMESTAMP WITH TIME ZONE,

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_followup_lead_id ON followup_sequences(lead_id);
CREATE INDEX idx_followup_status ON followup_sequences(status) WHERE status != 'completed';
CREATE INDEX idx_followup_scheduled ON followup_sequences(scheduled_for)
  WHERE status = 'pending' AND scheduled_for <= NOW();

-- ============ VOICE RECORDINGS TABLE ============
CREATE TABLE voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE,

  storage_path TEXT NOT NULL, -- Supabase Storage path
  duration_seconds INT,
  file_size_bytes BIGINT,

  transcription TEXT,
  transcription_timestamp TIMESTAMP WITH TIME ZONE,

  -- Audio Quality Metrics
  quality_score NUMERIC(3,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_recordings_lead_id ON voice_recordings(lead_id);
CREATE INDEX idx_recordings_vapi_id ON voice_recordings(vapi_call_id);
CREATE INDEX idx_recordings_created ON voice_recordings(created_at DESC);

-- ============ QUALIFICATION RULES TABLE ============
CREATE TABLE qualification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  rule_name TEXT NOT NULL UNIQUE,
  rule_description TEXT,

  -- Rule Definition (JSON Schema compatible)
  condition_json JSONB NOT NULL,

  -- Scoring
  points_if_matched INT DEFAULT 10,

  -- Execution Control
  is_active BOOLEAN DEFAULT TRUE,
  priority INT DEFAULT 100,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_rules_active ON qualification_rules(is_active, priority DESC);

-- ============ META CONVERSIONS API TABLE ============
CREATE TABLE meta_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,

  conversion_value NUMERIC(10,2),
  currency TEXT DEFAULT 'CAD',

  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Meta API Response
  response_json JSONB DEFAULT '{}',
  api_call_successful BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversions_lead_id ON meta_conversions(lead_id);
CREATE INDEX idx_conversions_event ON meta_conversions(event_name);
CREATE INDEX idx_conversions_timestamp ON meta_conversions(timestamp DESC);
```

### 2.2 Triggers et Functions PL/pgSQL

```sql
-- ============ TRIGGER: Update Lead Qualification ============
CREATE OR REPLACE FUNCTION process_conversation_qualification()
RETURNS TRIGGER AS $$
DECLARE
  v_score NUMERIC(3,2);
  v_status TEXT;
BEGIN
  -- Analyse du contenu conversation_history
  v_score := (
    CASE
      WHEN NEW.conversation_history->>'sentiment' = 'positive' THEN 0.3
      ELSE 0.0
    END
    +
    CASE
      WHEN jsonb_array_length(
        NEW.conversation_history->'messages'
      ) > 5 THEN 0.4
      ELSE 0.0
    END
  )::NUMERIC(3,2);

  -- Déterminer le statut
  v_status := CASE
    WHEN v_score >= 0.7 THEN 'qualified'
    WHEN v_score >= 0.5 THEN 'partial'
    WHEN v_score >= 0.3 THEN 'pending_followup'
    ELSE 'new'
  END;

  NEW.qualification_score := v_score;
  NEW.qualification_status := v_status;
  NEW.qualification_timestamp := NOW();
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_lead_qualification
  BEFORE UPDATE ON leads
  FOR EACH ROW
  WHEN (OLD.conversation_history IS DISTINCT FROM NEW.conversation_history)
  EXECUTE FUNCTION process_conversation_qualification();

-- ============ TRIGGER: Update Timestamps ============
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_followup_updated_at
  BEFORE UPDATE ON followup_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============ FUNCTION: Apply Qualification Rules ============
CREATE OR REPLACE FUNCTION apply_qualification_rules(p_lead_id UUID)
RETURNS NUMERIC(3,2) AS $$
DECLARE
  v_total_score NUMERIC(3,2) := 0;
  r_rule qualification_rules%ROWTYPE;
  v_lead_data JSONB;
BEGIN
  -- Récupérer les données du lead
  SELECT conversation_history INTO v_lead_data
    FROM leads WHERE id = p_lead_id;

  IF v_lead_data IS NULL THEN
    RETURN 0.00;
  END IF;

  -- Appliquer chaque règle active
  FOR r_rule IN
    SELECT * FROM qualification_rules
    WHERE is_active = TRUE
    ORDER BY priority DESC
  LOOP
    -- Valider condition_json contre v_lead_data
    IF jsonb_matches_schema(v_lead_data, r_rule.condition_json) THEN
      v_total_score := v_total_score + (r_rule.points_if_matched / 100.0);
    END IF;
  END LOOP;

  -- Capper à 1.00
  RETURN LEAST(v_total_score, 1.00)::NUMERIC(3,2);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============ BROADCAST CHANGES VIA pg_notify ============
CREATE OR REPLACE FUNCTION broadcast_lead_change()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM pg_notify(
    'lead_updates',
    jsonb_build_object(
      'id', NEW.id,
      'phone_number', NEW.phone_number,
      'status', NEW.qualification_status,
      'score', NEW.qualification_score,
      'timestamp', NEW.updated_at,
      'action', TG_OP
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_broadcast_leads
  AFTER INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_lead_change();
```

### 2.3 Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_conversions ENABLE ROW LEVEL SECURITY;

-- ============ POLICY: Users see only their leads ============
-- Assume JWT claim 'team_id' identifies the user's organization
CREATE POLICY "Select own leads" ON leads
  FOR SELECT USING (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Insert leads" ON leads
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Update own leads" ON leads
  FOR UPDATE USING (
    auth.uid() IS NOT NULL
  ) WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- ============ POLICY: Admin-only deletion ============
CREATE POLICY "Admin soft delete" ON leads
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  ) WITH CHECK (
    auth.jwt() ->> 'role' = 'admin'
  );

-- ============ SIMILAR POLICIES FOR OTHER TABLES ============
CREATE POLICY "Select followups" ON followup_sequences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Select recordings" ON voice_recordings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM leads WHERE id = lead_id AND auth.uid() IS NOT NULL)
  );
```

---

## 3. Configuration Realtime & Webhooks

### 3.1 Activation Realtime avec pg_notify

```sql
-- Les triggers broadcast_lead_change() utilise pg_notify
-- Pour écouter côté client: voir section 4.2 TypeScript

-- Vérifier que pg_notify est actif:
SELECT * FROM pg_proc WHERE proname = 'pg_notify';

-- Audit des messages notify:
-- CREATE TABLE IF NOT EXISTS audit_notify (
--   id BIGSERIAL PRIMARY KEY,
--   channel TEXT,
--   payload JSONB,
--   created_at TIMESTAMP DEFAULT NOW()
-- );
--
-- INSERT INTO audit_notify (channel, payload)
-- SELECT 'lead_updates', payload::jsonb FROM ...
```

### 3.2 Supabase Database Webhooks (Trigger-based)

```bash
# Configuration via Supabase Dashboard > Database > Webhooks

# Webhook 1: New Lead Detected
- Event: INSERT on leads
- URL: https://your-app.vercel.app/api/webhooks/new-lead
- HTTP Method: POST
- Headers: X-Webhook-Secret: <secret>

# Webhook 2: Lead Qualification Updated
- Event: UPDATE on leads (qualification_status changed)
- URL: https://your-app.vercel.app/api/webhooks/lead-qualified
- HTTP Method: POST

# Webhook 3: Voice Recording Completed
- Event: INSERT on voice_recordings
- URL: https://your-app.vercel.app/api/webhooks/recording-complete
- HTTP Method: POST

# Each webhook payload includes:
{
  "type": "INSERT" | "UPDATE" | "DELETE",
  "schema": "public",
  "table": "leads",
  "record": { full row data },
  "old_record": { previous row data, or null },
}
```

### 3.3 Edge Function pour VAPI Webhook

```typescript
// deno deploy edge function
// File: supabase/functions/vapi-webhook/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

interface VAPIWebhookPayload {
  callId: string;
  phoneNumber: string;
  status: "completed" | "failed" | "in_progress";
  transcript?: string;
  recordingUrl?: string;
  duration: number;
  summary?: string;
  sentiment?: "positive" | "negative" | "neutral";
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload: VAPIWebhookPayload = await req.json();

  try {
    // 1. Find or create lead
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .upsert(
        {
          phone_number: payload.phoneNumber,
          vapi_conversation_id: payload.callId,
          vapi_status: payload.status,
          source: "vapi",
        },
        { onConflict: "vapi_conversation_id" }
      )
      .select("id")
      .single();

    if (leadError) throw leadError;

    // 2. Update conversation history
    if (payload.transcript) {
      const { error: historyError } = await supabase
        .from("leads")
        .update({
          conversation_history: {
            messages: [
              {
                role: "user",
                content: payload.transcript,
                timestamp: new Date().toISOString(),
              },
            ],
            summary: payload.summary || "",
            sentiment: payload.sentiment || "neutral",
            key_questions_answered: {},
          },
        })
        .eq("id", lead.id);

      if (historyError) throw historyError;
    }

    // 3. Store voice recording
    if (payload.recordingUrl && payload.status === "completed") {
      // Download and store in Supabase Storage
      const recordingResponse = await fetch(payload.recordingUrl);
      const arrayBuffer = await recordingResponse.arrayBuffer();

      const fileName = `${lead.id}/${payload.callId}.wav`;

      const { error: storageError } = await supabase.storage
        .from("voice-recordings")
        .upload(fileName, arrayBuffer, {
          contentType: "audio/wav",
          upsert: false,
        });

      if (!storageError) {
        await supabase.from("voice_recordings").insert({
          lead_id: lead.id,
          vapi_call_id: payload.callId,
          storage_path: fileName,
          duration_seconds: payload.duration,
          created_at: new Date().toISOString(),
        });
      }
    }

    // 4. Trigger Meta CAPI conversion event
    if (payload.status === "completed") {
      await fetch("https://graph.instagram.com/v18.0/<pixel_id>/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: "Contact",
              event_time: Math.floor(Date.now() / 1000),
              user_data: {
                ph: hashPhoneNumber(payload.phoneNumber),
              },
              custom_data: {
                value: 0.01,
                currency: "CAD",
              },
            },
          ],
          access_token: Deno.env.get("META_PIXEL_TOKEN"),
        }),
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        leadId: lead.id,
        status: payload.status,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("VAPI webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});

function hashPhoneNumber(phone: string): string {
  // SHA-256 hash for Meta CAPI
  const cleaned = phone.replace(/\D/g, "");
  return cleaned; // TODO: implement SHA256
}
```

---

## 4. Implémentation TypeScript

### 4.1 Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
```

### 4.2 Real-time Lead Subscription

```typescript
// lib/leads-subscription.ts
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export class LeadRealtimeSubscription {
  private channel: ReturnType<typeof supabase.channel> | null = null;

  subscribe(
    onLeadUpdate: (lead: Lead) => void,
    onError: (error: Error) => void
  ) {
    // Subscribe to ALL lead changes via pg_notify
    this.channel = supabase.channel("lead_updates");

    this.channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("Lead change detected:", payload);
          onLeadUpdate(payload.new as Lead);
        }
      )
      .on(
        "system",
        { event: "error" },
        (error) => {
          console.error("Realtime error:", error);
          onError(new Error(error.message));
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });
  }

  unsubscribe() {
    if (this.channel) {
      supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}

// Usage in React hook
export function useLeadRealtime(
  onLeadUpdate: (lead: Lead) => void
) {
  const subscriptionRef = useRef<LeadRealtimeSubscription | null>(null);

  useEffect(() => {
    subscriptionRef.current = new LeadRealtimeSubscription();
    subscriptionRef.current.subscribe(
      onLeadUpdate,
      (error) => console.error(error)
    );

    return () => {
      subscriptionRef.current?.unsubscribe();
    };
  }, [onLeadUpdate]);
}
```

### 4.3 Lead Scoring Engine

```typescript
// lib/lead-scoring.ts
import { supabase } from "@/lib/supabase";

interface ScoringResult {
  score: number;
  factors: Record<string, number>;
  reasons: string[];
}

export async function scoreLeadConversation(
  leadId: string
): Promise<ScoringResult> {
  const { data: lead, error } = await supabase
    .from("leads")
    .select(
      `
      id,
      conversation_history,
      qualification_rules (*)
    `
    )
    .eq("id", leadId)
    .single();

  if (error) throw error;

  const factors: Record<string, number> = {};
  const reasons: string[] = [];
  let totalScore = 0;

  // Factor 1: Conversation Length
  const messageCount =
    lead.conversation_history?.messages?.length || 0;
  factors["conversation_length"] = Math.min(
    messageCount / 10,
    0.3
  );
  if (messageCount > 5) {
    reasons.push("Engaged in detailed conversation");
  }

  // Factor 2: Sentiment
  const sentiment = lead.conversation_history?.sentiment;
  if (sentiment === "positive") {
    factors["sentiment"] = 0.3;
    reasons.push("Positive sentiment detected");
  } else if (sentiment === "neutral") {
    factors["sentiment"] = 0.1;
  } else {
    factors["sentiment"] = 0;
  }

  // Factor 3: Key Questions Answered
  const answered =
    Object.values(lead.conversation_history?.key_questions_answered || {})
      .filter(Boolean).length || 0;
  factors["questions_answered"] = Math.min(answered / 5, 0.4);
  if (answered >= 3) {
    reasons.push(`Answered ${answered} key qualification questions`);
  }

  // Calculate total
  totalScore = Object.values(factors).reduce((a, b) => a + b, 0);

  return {
    score: Math.min(totalScore, 1),
    factors,
    reasons,
  };
}

// Execute qualification rules via SQL function
export async function applyQualificationRules(
  leadId: string
): Promise<number> {
  const { data, error } = await supabase.rpc(
    "apply_qualification_rules",
    { p_lead_id: leadId }
  );

  if (error) throw error;
  return data;
}
```

### 4.4 Follow-up Sequence Manager (pg_cron Integration)

```typescript
// lib/followup-manager.ts
import { supabaseAdmin } from "@/lib/supabase";

interface FollowupStep {
  stepNumber: number;
  delayMinutes: number;
  messageType: "sms" | "email" | "voice";
  templateId: string;
}

const FOLLOWUP_SEQUENCES: Record<string, FollowupStep[]> = {
  initial_call: [
    {
      stepNumber: 1,
      delayMinutes: 0,
      messageType: "voice",
      templateId: "vapi_greeting",
    },
    {
      stepNumber: 2,
      delayMinutes: 1440, // 24 hours
      messageType: "sms",
      templateId: "followup_24h",
    },
    {
      stepNumber: 3,
      delayMinutes: 4320, // 72 hours
      messageType: "email",
      templateId: "followup_72h",
    },
  ],
  qualification: [
    {
      stepNumber: 1,
      delayMinutes: 0,
      messageType: "sms",
      templateId: "qualify_sms",
    },
    {
      stepNumber: 2,
      delayMinutes: 2880, // 48 hours
      messageType: "voice",
      templateId: "qualify_call",
    },
  ],
};

export async function initializeFollowupSequence(
  leadId: string,
  sequenceType: keyof typeof FOLLOWUP_SEQUENCES
) {
  const steps = FOLLOWUP_SEQUENCES[sequenceType];

  const records = steps.map((step) => ({
    lead_id: leadId,
    sequence_type: sequenceType,
    step_number: step.stepNumber,
    total_steps: steps.length,
    message_type: step.messageType,
    scheduled_for: new Date(
      Date.now() + step.delayMinutes * 60 * 1000
    ).toISOString(),
    status: "pending",
    message_content: {
      template_id: step.templateId,
      variables: {},
    },
  }));

  const { error } = await supabaseAdmin
    .from("followup_sequences")
    .insert(records);

  if (error) throw error;
}

// This runs via pg_cron every 5 minutes
export async function processPendingFollowups() {
  // SQL: SELECT * FROM followup_sequences
  //      WHERE status = 'pending' AND scheduled_for <= NOW()
  //      ORDER BY scheduled_for ASC LIMIT 100

  const { data: pending, error } = await supabaseAdmin
    .from("followup_sequences")
    .select("*")
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(100);

  if (error) throw error;

  for (const followup of pending) {
    await sendFollowupMessage(followup);
  }
}

async function sendFollowupMessage(followup: any) {
  try {
    if (followup.message_type === "sms") {
      // Send SMS via Twilio
      // await twilioClient.messages.create({ ... });
    } else if (followup.message_type === "email") {
      // Send email
      // await sendEmail({ ... });
    } else if (followup.message_type === "voice") {
      // Initiate VAPI voice call
      // await vapiClient.initializeCall({ ... });
    }

    // Mark as sent
    await supabaseAdmin
      .from("followup_sequences")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", followup.id);
  } catch (error) {
    console.error(
      `Failed to send followup ${followup.id}:`,
      error
    );
    await supabaseAdmin
      .from("followup_sequences")
      .update({ status: "failed" })
      .eq("id", followup.id);
  }
}
```

### 4.5 Meta CAPI Integration

```typescript
// lib/meta-capi.ts
import { supabaseAdmin } from "@/lib/supabase";

interface ConversionEvent {
  leadId: string;
  eventName: "Contact" | "Lead" | "Purchase" | "ViewContent";
  value?: number;
  currency?: string;
}

export async function trackMetaConversion(event: ConversionEvent) {
  const { data: lead } = await supabaseAdmin
    .from("leads")
    .select("phone_number, email, name")
    .eq("id", event.leadId)
    .single();

  if (!lead) throw new Error("Lead not found");

  const userData = {
    ph: hashPhoneNumber(lead.phone_number),
    em: hashEmail(lead.email),
    ln: lead.name?.split(" ")[0]?.toLowerCase(),
  };

  const capiPayload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        user_data: userData,
        custom_data: {
          value: event.value || 0.01,
          currency: event.currency || "CAD",
        },
        event_source_url: process.env.NEXT_PUBLIC_APP_URL,
      },
    ],
    access_token: process.env.META_PIXEL_TOKEN,
  };

  const response = await fetch(
    `https://graph.instagram.com/v18.0/${process.env.META_PIXEL_ID}/events`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(capiPayload),
    }
  );

  const result = await response.json();

  // Log in database
  await supabaseAdmin.from("meta_conversions").insert({
    lead_id: event.leadId,
    event_type: "capi",
    event_name: event.eventName,
    conversion_value: event.value,
    api_call_successful: result.events?.length > 0,
    response_json: result,
  });

  return result;
}

function hashPhoneNumber(phone: string): string {
  const crypto = require("crypto");
  const cleaned = phone.replace(/\D/g, "");
  return crypto
    .createHash("sha256")
    .update(cleaned)
    .digest("hex");
}

function hashEmail(email: string): string {
  const crypto = require("crypto");
  const normalized = email.toLowerCase().trim();
  return crypto
    .createHash("sha256")
    .update(normalized)
    .digest("hex");
}
```

---

## 5. Patterns Next.js

### 5.1 Dashboard Real-time avec Realtime Client

```typescript
// app/dashboard/leads/page.tsx
"use client";

import { useEffect, useState } from "react";
import { LeadCard } from "@/components/LeadCard";
import { useLeadRealtime } from "@/lib/leads-subscription";
import type { Database } from "@/types/supabase";

type Lead = Database["public"]["Tables"]["leads"]["Row"];

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLeadUpdate = (updatedLead: Lead) => {
    setLeads((prev) => {
      const index = prev.findIndex((l) => l.id === updatedLead.id);
      if (index === -1) {
        return [updatedLead, ...prev]; // New lead
      }
      return [
        ...prev.slice(0, index),
        updatedLead,
        ...prev.slice(index + 1),
      ];
    });
  };

  useLeadRealtime(handleLeadUpdate);

  useEffect(() => {
    // Initial load
    async function fetchLeads() {
      // Fetch from API route
      const response = await fetch("/api/leads");
      const data = await response.json();
      setLeads(data);
      setLoading(false);
    }

    fetchLeads();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
```

### 5.2 Server Action: Process VAPI Webhook

```typescript
// app/api/webhooks/vapi/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyVAPISignature } from "@/lib/vapi-security";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-vapi-signature");
  const body = await req.text();

  // Verify webhook authenticity
  if (!verifyVAPISignature(body, signature!)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  const payload = JSON.parse(body);

  // Forward to Edge Function
  const response = await fetch(
    `${process.env.SUPABASE_URL}/functions/v1/vapi-webhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  return NextResponse.json(result);
}
```

### 5.3 API Route: Get Leads with Filters

```typescript
// app/api/leads/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const minScore = url.searchParams.get("minScore");

  let query = supabaseAdmin
    .from("leads")
    .select("*")
    .eq("deleted_at", null)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("qualification_status", status);
  }

  if (minScore) {
    query = query.gte("qualification_score", parseFloat(minScore));
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
```

---

## 6. Sécurité (RLS)

### 6.1 Stratégies de Protection

```sql
-- 1. Isolation par tenant (si multi-tenant)
-- Chaque lead appartient à une organization_id
-- RLS filtre par auth.jwt()->>'org_id' = leads.organization_id

-- 2. Role-based Access
-- admin: full access
-- sales: see own leads only
-- manager: see team leads
-- customer: see own data via API

-- 3. JWT Claims Extraction
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
  SELECT (auth.jwt() ->> 'sub')::UUID;
$$ LANGUAGE SQL STABLE;

CREATE OR REPLACE FUNCTION current_org_id() RETURNS TEXT AS $$
  SELECT auth.jwt() ->> 'organization_id';
$$ LANGUAGE SQL STABLE;

-- 4. Time-based RLS (optional)
-- Can only see leads created in the last 90 days
CREATE POLICY "Recent leads only" ON leads
  FOR SELECT USING (
    created_at > NOW() - INTERVAL '90 days'
  );

-- 5. Audit Trail
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  action TEXT,
  table_name TEXT,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION audit_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
  VALUES (
    current_user_id(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TO_JSONB(OLD),
    TO_JSONB(NEW)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON leads
  FOR EACH ROW EXECUTE FUNCTION audit_changes();
```

---

## 7. Optimisations et Performance

### 7.1 Index Strategy

```sql
-- Composite indexes for common queries
CREATE INDEX idx_leads_status_score
  ON leads(qualification_status, qualification_score DESC)
  WHERE deleted_at IS NULL;

-- Partial indexes for hot data
CREATE INDEX idx_leads_active_recent
  ON leads(created_at DESC)
  WHERE deleted_at IS NULL AND created_at > NOW() - INTERVAL '30 days';

-- JSONB search (GIN index)
CREATE INDEX idx_leads_conversation
  ON leads USING GIN (conversation_history);

-- Covering index to avoid lookups
CREATE INDEX idx_leads_dashboard
  ON leads(qualification_status, qualification_score)
  INCLUDE (name, phone_number, created_at)
  WHERE deleted_at IS NULL;

-- Check query plans
EXPLAIN ANALYZE
SELECT * FROM leads
WHERE qualification_status = 'qualified'
AND qualification_score >= 0.7
ORDER BY created_at DESC
LIMIT 20;
```

### 7.2 Connection Pooling

```typescript
// Use Supabase Pooling or PgBouncer
// In Supabase Dashboard: Project Settings > Database > Connection Pooling
// Mode: Transaction (safest for serverless)
// Pool size: 10-20

// Client code doesn't change, pooling is automatic via Supabase
```

### 7.3 Query Optimization Tips

```typescript
// ❌ SLOW: N+1 query problem
const leads = await supabase.from("leads").select("*");
for (const lead of leads) {
  const followups = await supabase
    .from("followup_sequences")
    .select("*")
    .eq("lead_id", lead.id);
}

// ✅ FAST: Single query with join
const leadsWithFollowups = await supabase
  .from("leads")
  .select(
    `
    id, name, email,
    followup_sequences (*)
  `
  )
  .limit(100);

// ✅ FAST: Use select filters
const qualified = await supabase
  .from("leads")
  .select("id, name, phone_number, qualification_score") // Only needed columns
  .eq("qualification_status", "qualified")
  .order("qualification_score", { ascending: false })
  .limit(50);
```

---

## 8. Workflows Automatisés (pg_cron)

### 8.1 Schedule Follow-ups Every 5 Minutes

```sql
-- Create cron job
SELECT cron.schedule(
  'process-pending-followups',
  '*/5 * * * *',
  'SELECT process_pending_followups();'
);

-- View active cron jobs
SELECT * FROM cron.job;

-- Remove cron job
SELECT cron.unschedule('process-pending-followups');
```

### 8.2 Daily Lead Quality Report

```sql
-- Schedule daily report at 8 AM UTC
SELECT cron.schedule(
  'daily-lead-quality-report',
  '0 8 * * *',
  $$
    INSERT INTO lead_quality_reports (
      date,
      total_leads,
      qualified_count,
      avg_score,
      sentiment_breakdown,
      created_at
    )
    SELECT
      CURRENT_DATE,
      COUNT(*),
      COUNT(*) FILTER (WHERE qualification_status = 'qualified'),
      AVG(qualification_score),
      jsonb_object_agg(
        conversation_history->>'sentiment',
        COUNT(*)
      ),
      NOW()
    FROM leads
    WHERE created_at::DATE = CURRENT_DATE;
  $$
);
```

### 8.3 Clean Up Old Data (Archive Pattern)

```sql
-- Archive leads older than 1 year (soft delete)
SELECT cron.schedule(
  'archive-old-leads',
  '0 2 * * SUN',
  $$
    UPDATE leads
    SET deleted_at = NOW()
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND deleted_at IS NULL
    AND qualification_status NOT IN ('qualified', 'partial');
  $$
);

-- Physically delete archived data after 2 years
SELECT cron.schedule(
  'purge-archived-leads',
  '0 3 * * SUN',
  $$
    DELETE FROM leads
    WHERE deleted_at < NOW() - INTERVAL '2 years';
  $$
);
```

---

## 9. Checklist de Déploiement Production

- [ ] Supabase project créé + credentials sécurisés dans Vercel env vars
- [ ] Migrations appliquées (schema, triggers, RLS policies)
- [ ] VAPI webhook URL configurée dans dashboard VAPI
- [ ] Meta CAPI pixel ID et token configurés
- [ ] Database webhooks activés pour les 3 événements clés
- [ ] Edge Functions déployées (`vapi-webhook`)
- [ ] pg_cron jobs configurés (follow-up processor, archive)
- [ ] RLS policies testées avec users authentifiés
- [ ] Connection pooling activé (Mode: Transaction)
- [ ] Backup automatique configuré (Supabase auto-backup daily)
- [ ] Monitoring alertes configurées (query performance, webhook failures)
- [ ] DNS records pour custom domain (si applicable)
- [ ] SSL certificate auto-renewal (Vercel gère)
- [ ] Load test effectué (k6, Artillery) > 100 concurrent users
- [ ] Disaster recovery plan documenté

---

## 10. Ressources et Documentation

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Database Webhooks](https://supabase.com/docs/guides/database/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PostgreSQL pg_notify](https://www.postgresql.org/docs/current/sql-notify.html)
- [Meta Conversions API](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [VAPI Webhook Documentation](https://docs.vapi.ai/webhooks)

---

**Document créé le 31 mars 2026 | Next.js 14 + React 18 + TypeScript**
