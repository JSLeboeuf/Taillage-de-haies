-- Weather Intelligent Scheduler: reschedule tracking + fix weather_alerts schema
-- Depends on: 20260224202100_initial_schema.sql (weather_alerts table)

-- Fix weather_alerts: add columns used by code but missing from schema
ALTER TABLE weather_alerts
  ADD COLUMN IF NOT EXISTS affected_job_uuids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS reschedule_run_at TIMESTAMPTZ;

-- Individual job reschedule tracking
CREATE TABLE IF NOT EXISTS weather_reschedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weather_alert_id UUID REFERENCES weather_alerts(id) ON DELETE CASCADE,

  -- ServiceM8 job info
  job_uuid TEXT NOT NULL,
  activity_uuid TEXT NOT NULL,
  company_uuid TEXT NOT NULL,

  -- Customer info for SMS
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,

  -- Reschedule details
  original_date DATE NOT NULL,
  new_date DATE NOT NULL,
  weather_reason TEXT NOT NULL,

  -- State machine
  status TEXT NOT NULL DEFAULT 'pending_confirmation'
    CHECK (status IN (
      'pending_confirmation',
      'confirmed',
      'human_requested',
      'auto_confirmed',
      'servicem8_updated'
    )),

  -- ServiceM8 sync
  servicem8_updated BOOLEAN DEFAULT FALSE,
  servicem8_updated_at TIMESTAMPTZ,

  -- SMS tracking
  sms_sent_at TIMESTAMPTZ,
  customer_responded_at TIMESTAMPTZ,
  customer_response TEXT,

  -- Auto-confirm after 20h without response
  auto_confirm_after TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_wr_phone ON weather_reschedules(customer_phone);
CREATE INDEX idx_wr_pending ON weather_reschedules(status)
  WHERE status = 'pending_confirmation';
CREATE INDEX idx_wr_job ON weather_reschedules(job_uuid);

-- RLS
ALTER TABLE weather_reschedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY service_role_all ON weather_reschedules
  FOR ALL TO service_role USING (true) WITH CHECK (true);
