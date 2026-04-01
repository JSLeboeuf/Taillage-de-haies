-- Migration 006: AI Lead Qualifier
-- Tables for SMS AI qualification, cascade tracking, appointments, calls, WhatsApp

-- ============================================================================
-- SMS Conversations (AI qualification multi-turn)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sms_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'greeting'
    CHECK (state IN ('greeting', 'qualifying', 'scheduling', 'handoff', 'completed', 'dead')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  qualification_data JSONB DEFAULT '{}'::jsonb,
  qualification_score INT DEFAULT 0 CHECK (qualification_score BETWEEN 0 AND 10),
  turn_count INT DEFAULT 0,
  ai_model TEXT DEFAULT 'claude-3-5-haiku-20241022',
  total_input_tokens INT DEFAULT 0,
  total_output_tokens INT DEFAULT 0,
  cost_usd NUMERIC(10,6) DEFAULT 0,
  consent_sms BOOLEAN DEFAULT false,
  opt_out BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days'
);

CREATE INDEX IF NOT EXISTS idx_sms_conv_lead ON sms_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_sms_conv_phone ON sms_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_conv_state ON sms_conversations(state);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_conv_lead_active ON sms_conversations(lead_id) WHERE state NOT IN ('dead', 'completed');

-- ============================================================================
-- Cascade Tracking (progression through 4 tiers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS cascade_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  current_tier INT NOT NULL DEFAULT 1 CHECK (current_tier BETWEEN 1 AND 4),
  tier1_sms_sent_at TIMESTAMPTZ,
  tier1_sms_responded BOOLEAN DEFAULT false,
  tier1_completed_at TIMESTAMPTZ,
  tier2_call_sent_at TIMESTAMPTZ,
  tier2_call_answered BOOLEAN DEFAULT false,
  tier2_call_id TEXT,
  tier2_completed_at TIMESTAMPTZ,
  tier3_whatsapp_sent_at TIMESTAMPTZ,
  tier3_whatsapp_responded BOOLEAN DEFAULT false,
  tier3_completed_at TIMESTAMPTZ,
  tier4_email_started_at TIMESTAMPTZ,
  tier4_email_step INT DEFAULT 0,
  tier4_completed_at TIMESTAMPTZ,
  final_outcome TEXT CHECK (final_outcome IS NULL OR final_outcome IN (
    'qualified', 'appointment_booked', 'not_interested',
    'wrong_number', 'no_response', 'disqualified'
  )),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cascade_lead ON cascade_tracking(lead_id);

-- ============================================================================
-- Appointments (booked by AI)
-- ============================================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  source TEXT NOT NULL CHECK (source IN ('sms_ai', 'vapi_call', 'whatsapp', 'manual')),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
  servicem8_job_uuid TEXT,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_appointments_lead ON appointments(lead_id);

-- ============================================================================
-- Call Results (VAPI transcriptions + analyses)
-- ============================================================================
CREATE TABLE IF NOT EXISTS call_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  vapi_call_id TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  duration_seconds INT,
  status TEXT NOT NULL,
  transcript TEXT,
  analysis JSONB,
  qualification_score FLOAT,
  sentiment TEXT,
  next_steps TEXT[],
  recording_url TEXT,
  cost_usd NUMERIC(10,4),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_call_results_lead ON call_results(lead_id);

-- ============================================================================
-- WhatsApp Messages
-- ============================================================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text', 'template', 'image', 'document')),
  content TEXT,
  template_name TEXT,
  wa_message_id TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wa_messages_lead ON whatsapp_messages(lead_id);

-- ============================================================================
-- Functions & Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_sms_conversations_updated ON sms_conversations;
CREATE TRIGGER tr_sms_conversations_updated
  BEFORE UPDATE ON sms_conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS tr_cascade_tracking_updated ON cascade_tracking;
CREATE TRIGGER tr_cascade_tracking_updated
  BEFORE UPDATE ON cascade_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Cascade escalation function
CREATE OR REPLACE FUNCTION escalate_cascade()
RETURNS TABLE(lead_id UUID, from_tier INT, to_tier INT) AS $$
BEGIN
  RETURN QUERY
  UPDATE cascade_tracking ct SET
    current_tier = 2, tier1_completed_at = now()
  WHERE ct.current_tier = 1
    AND ct.tier1_sms_sent_at IS NOT NULL
    AND ct.tier1_sms_responded = false
    AND ct.tier1_sms_sent_at < now() - INTERVAL '2 hours'
    AND ct.final_outcome IS NULL
  RETURNING ct.lead_id, 1 AS from_tier, 2 AS to_tier;

  RETURN QUERY
  UPDATE cascade_tracking ct SET
    current_tier = 3, tier2_completed_at = now()
  WHERE ct.current_tier = 2
    AND ct.tier2_call_sent_at IS NOT NULL
    AND ct.tier2_call_answered = false
    AND ct.tier2_call_sent_at < now() - INTERVAL '4 hours'
    AND ct.final_outcome IS NULL
  RETURNING ct.lead_id, 2 AS from_tier, 3 AS to_tier;

  RETURN QUERY
  UPDATE cascade_tracking ct SET
    current_tier = 4, tier3_completed_at = now()
  WHERE ct.current_tier = 3
    AND ct.tier3_whatsapp_sent_at IS NOT NULL
    AND ct.tier3_whatsapp_responded = false
    AND ct.tier3_whatsapp_sent_at < now() - INTERVAL '24 hours'
    AND ct.final_outcome IS NULL
  RETURNING ct.lead_id, 3 AS from_tier, 4 AS to_tier;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE sms_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cascade_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "service_role_sms_conversations" ON sms_conversations;
  CREATE POLICY "service_role_sms_conversations" ON sms_conversations
    FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "service_role_cascade_tracking" ON cascade_tracking;
  CREATE POLICY "service_role_cascade_tracking" ON cascade_tracking
    FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "service_role_appointments" ON appointments;
  CREATE POLICY "service_role_appointments" ON appointments
    FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "service_role_call_results" ON call_results;
  CREATE POLICY "service_role_call_results" ON call_results
    FOR ALL USING (true) WITH CHECK (true);
  DROP POLICY IF EXISTS "service_role_whatsapp_messages" ON whatsapp_messages;
  CREATE POLICY "service_role_whatsapp_messages" ON whatsapp_messages
    FOR ALL USING (true) WITH CHECK (true);
END $$;
