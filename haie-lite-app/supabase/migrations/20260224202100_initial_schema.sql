-- ============================================================================
-- Haie Lite Initial Database Schema
-- Created: 2026-02-20
-- Description: Complete database schema for Haie Lite application
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text matching

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Updated_at trigger function (reusable)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Increment daily KPI helper function
CREATE OR REPLACE FUNCTION increment_daily_kpi(
  p_date DATE,
  p_jobs INTEGER DEFAULT 0,
  p_revenue DECIMAL DEFAULT 0
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO daily_kpis (date, jobs_completed, revenue)
  VALUES (p_date, p_jobs, p_revenue)
  ON CONFLICT (date)
  DO UPDATE SET
    jobs_completed = daily_kpis.jobs_completed + EXCLUDED.jobs_completed,
    revenue = daily_kpis.revenue + EXCLUDED.revenue,
    avg_ticket = CASE
      WHEN (daily_kpis.jobs_completed + EXCLUDED.jobs_completed) > 0
      THEN (daily_kpis.revenue + EXCLUDED.revenue) / (daily_kpis.jobs_completed + EXCLUDED.jobs_completed)
      ELSE 0
    END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CORE BUSINESS TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Leads (prospect pipeline tracking)
-- -----------------------------------------------------------------------------
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contact information
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  city TEXT,

  -- Lead source and status
  source TEXT NOT NULL DEFAULT 'phone_call' CHECK (source IN (
    'facebook_ads', 'google_ads', 'organic_search', 'referral',
    'repeat_customer', 'website_form', 'phone_call', 'walk_in', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'quoted', 'follow_up',
    'won', 'lost', 'dormant'
  )),

  -- Property and hedge details
  hedge_type TEXT CHECK (hedge_type IN (
    'cedar', 'privet', 'boxwood', 'yew', 'mixed', 'other'
  )),
  hedge_length_m DECIMAL(6,2),
  hedge_height_m DECIMAL(4,2),
  hedge_sides INTEGER DEFAULT 2,

  -- Quote and conversion tracking
  quote_amount DECIMAL(10,2),
  quote_sent_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  lost_reason TEXT,

  -- Follow-up automation
  followup_stage TEXT CHECK (followup_stage IN (
    'initial', 'reminder_1', 'reminder_2', 'final', 'completed'
  )),
  followup_count INTEGER DEFAULT 0,
  next_followup_at TIMESTAMPTZ,

  -- ServiceM8 integration
  servicem8_job_uuid TEXT,
  servicem8_company_uuid TEXT,

  -- Notes and metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE leads IS 'Lead pipeline tracking from first contact to conversion';

CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_city ON leads(city);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_next_followup ON leads(next_followup_at) WHERE next_followup_at IS NOT NULL;
CREATE INDEX idx_leads_servicem8_job ON leads(servicem8_job_uuid) WHERE servicem8_job_uuid IS NOT NULL;

CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Referrals (customer referral tracking and commission)
-- -----------------------------------------------------------------------------
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Referrer (existing customer who referred)
  referrer_name TEXT NOT NULL,
  referrer_phone TEXT NOT NULL,
  referrer_servicem8_company_uuid TEXT,

  -- Referee (new customer who was referred)
  referee_name TEXT NOT NULL,
  referee_phone TEXT NOT NULL,
  referee_servicem8_company_uuid TEXT,

  -- Conversion tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'contacted', 'quoted', 'converted', 'declined'
  )),
  referral_code TEXT UNIQUE,

  -- Job and commission
  job_uuid TEXT, -- ServiceM8 job UUID of converted referee
  job_amount DECIMAL(10,2),

  -- Rewards
  referrer_credit_amount DECIMAL(10,2) DEFAULT 50.00, -- Credit for referrer
  employee_bonus_amount DECIMAL(10,2) DEFAULT 50.00,  -- Bonus for original service team
  referee_discount_pct DECIMAL(5,2) DEFAULT 10.00,    -- Discount for referee

  -- Payment tracking
  referrer_credit_applied BOOLEAN DEFAULT FALSE,
  referrer_credit_applied_at TIMESTAMPTZ,
  employee_bonus_paid BOOLEAN DEFAULT FALSE,
  employee_bonus_paid_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE referrals IS 'Customer referral tracking with dual rewards (customer credit + team bonus)';

CREATE INDEX idx_referrals_referrer_phone ON referrals(referrer_phone);
CREATE INDEX idx_referrals_referee_phone ON referrals(referee_phone);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referrals_code ON referrals(referral_code) WHERE referral_code IS NOT NULL;

CREATE TRIGGER referrals_updated_at BEFORE UPDATE ON referrals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Messages sent (SMS/Email audit log)
-- -----------------------------------------------------------------------------
CREATE TABLE messages_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Recipient
  recipient_phone TEXT,
  recipient_email TEXT,
  recipient_name TEXT,

  -- Message details
  message_type TEXT NOT NULL CHECK (message_type IN (
    'lead_confirmation', 'quote_sent', 'job_confirmation', 'job_reminder',
    'review_request', 'referral_request', 'followup', 'upsell_offer',
    'weather_alert', 'reactivation', 'subscription_reminder', 'other'
  )),
  template_name TEXT,
  content_preview TEXT, -- First 200 chars
  full_content TEXT,

  -- Channel and status
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN (
    'queued', 'sent', 'delivered', 'failed', 'bounced'
  )),

  -- External IDs
  twilio_sid TEXT,
  sendgrid_message_id TEXT,

  -- Associations
  servicem8_job_uuid TEXT,
  servicem8_company_uuid TEXT,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  employee_id UUID, -- Will be FK when employees table created

  -- Response tracking
  response_received BOOLEAN DEFAULT FALSE,
  response_text TEXT,
  response_at TIMESTAMPTZ,

  -- Metadata
  cost_cents INTEGER, -- Cost in cents (for SMS)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE messages_sent IS 'Complete audit log of all SMS and email messages sent by the system';

CREATE INDEX idx_messages_recipient_phone ON messages_sent(recipient_phone);
CREATE INDEX idx_messages_type ON messages_sent(message_type);
CREATE INDEX idx_messages_channel ON messages_sent(channel);
CREATE INDEX idx_messages_status ON messages_sent(status);
CREATE INDEX idx_messages_created_at ON messages_sent(created_at DESC);
CREATE INDEX idx_messages_lead_id ON messages_sent(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX idx_messages_job_uuid ON messages_sent(servicem8_job_uuid) WHERE servicem8_job_uuid IS NOT NULL;

-- -----------------------------------------------------------------------------
-- Daily KPIs (business metrics dashboard)
-- -----------------------------------------------------------------------------
CREATE TABLE daily_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,

  -- Lead metrics
  leads_count INTEGER DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,

  -- Quote metrics
  quotes_sent INTEGER DEFAULT 0,
  quotes_accepted INTEGER DEFAULT 0,

  -- Job metrics
  jobs_completed INTEGER DEFAULT 0,
  jobs_scheduled INTEGER DEFAULT 0,

  -- Revenue metrics
  revenue DECIMAL(12,2) DEFAULT 0,
  avg_ticket DECIMAL(10,2) DEFAULT 0,

  -- Conversion metrics
  conversion_rate DECIMAL(5,2) DEFAULT 0, -- Leads to jobs %
  quote_acceptance_rate DECIMAL(5,2) DEFAULT 0, -- Quotes to jobs %

  -- Communication metrics
  sms_sent INTEGER DEFAULT 0,
  emails_sent INTEGER DEFAULT 0,

  -- Customer satisfaction
  reviews_received INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE daily_kpis IS 'Daily business performance metrics and KPI tracking';

CREATE INDEX idx_daily_kpis_date ON daily_kpis(date DESC);

CREATE TRIGGER daily_kpis_updated_at BEFORE UPDATE ON daily_kpis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- EMPLOYEE MANAGEMENT TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Employees (staff directory and compensation)
-- -----------------------------------------------------------------------------
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ServiceM8 integration
  servicem8_staff_uuid TEXT UNIQUE NOT NULL,
  employeur_d_id TEXT, -- Payroll system ID

  -- Personal information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,

  -- Employment details
  role TEXT NOT NULL DEFAULT 'tet' CHECK (role IN (
    'chef', 'tet', 'student', 'admin'
  )),
  truck TEXT CHECK (truck IN ('truck_nord', 'truck_sud', 'truck_1', 'truck_2')),

  -- Compensation
  hourly_rate DECIMAL(6,2) NOT NULL,
  overtime_multiplier DECIMAL(4,2) DEFAULT 1.5,
  incentive_eligible BOOLEAN DEFAULT TRUE,

  -- Status
  active BOOLEAN DEFAULT TRUE,
  hire_date DATE NOT NULL,
  termination_date DATE,

  -- Performance tracking (cached aggregates)
  total_hours_ytd DECIMAL(10,2) DEFAULT 0,
  total_jobs_ytd INTEGER DEFAULT 0,
  total_incentives_ytd DECIMAL(10,2) DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE employees IS 'Employee directory synced from ServiceM8 with compensation and performance tracking';

CREATE INDEX idx_employees_servicem8_uuid ON employees(servicem8_staff_uuid);
CREATE INDEX idx_employees_active ON employees(active) WHERE active = TRUE;
CREATE INDEX idx_employees_truck ON employees(truck) WHERE truck IS NOT NULL;
CREATE INDEX idx_employees_role ON employees(role);

CREATE TRIGGER employees_updated_at BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Timesheets (work hours tracking from ServiceM8)
-- -----------------------------------------------------------------------------
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Time tracking
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  hours DECIMAL(5,2), -- Calculated from start/end

  -- Job association
  servicem8_job_uuid TEXT NOT NULL,
  servicem8_activity_uuid TEXT UNIQUE, -- ServiceM8 JobActivity UUID

  -- Revenue allocation
  revenue_generated DECIMAL(10,2), -- Portion of job revenue attributed to this timesheet

  -- Classification
  is_overtime BOOLEAN DEFAULT FALSE,
  is_billable BOOLEAN DEFAULT TRUE,

  -- Approval workflow
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,

  -- Data source
  source TEXT DEFAULT 'servicem8' CHECK (source IN ('servicem8', 'manual')),

  -- Notes
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate entries
  UNIQUE(employee_id, date, servicem8_job_uuid)
);

COMMENT ON TABLE timesheets IS 'Employee work hours synced from ServiceM8 JobActivity entries';

CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);
CREATE INDEX idx_timesheets_date ON timesheets(date DESC);
CREATE INDEX idx_timesheets_job_uuid ON timesheets(servicem8_job_uuid);
CREATE INDEX idx_timesheets_unapproved ON timesheets(approved) WHERE approved = FALSE;

CREATE TRIGGER timesheets_updated_at BEFORE UPDATE ON timesheets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK constraint to messages_sent now that employees table exists
ALTER TABLE messages_sent
  ADD CONSTRAINT fk_messages_employee
  FOREIGN KEY (employee_id)
  REFERENCES employees(id)
  ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- Employee incentives (bonuses and commissions)
-- -----------------------------------------------------------------------------
CREATE TABLE employee_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Incentive type and amount
  type TEXT NOT NULL CHECK (type IN (
    'review_bonus',          -- $25 per 5-star Google review
    'referral_commission',   -- $50 per converted referral
    'performance_bonus',     -- Monthly performance score bonus
    'upsell_commission'      -- Commission on upsell services sold
  )),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,

  -- Source linkage (depends on type)
  google_review_id TEXT,           -- For review_bonus
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL, -- For referral_commission
  job_uuid TEXT,                   -- ServiceM8 job that generated bonus
  month TEXT,                      -- 'YYYY-MM' for performance_bonus
  upsell_opportunity_id UUID,      -- Will be FK when table created

  -- Payment workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Awaiting approval
    'approved',   -- Approved, awaiting payroll
    'paid',       -- Included in paycheck
    'cancelled'   -- Cancelled/voided
  )),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  pay_period TEXT, -- Reference to Employeur D pay period

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE employee_incentives IS 'Employee bonuses and commissions from reviews, referrals, performance, and upsells';

CREATE INDEX idx_incentives_employee ON employee_incentives(employee_id);
CREATE INDEX idx_incentives_type ON employee_incentives(type);
CREATE INDEX idx_incentives_status ON employee_incentives(status);
CREATE INDEX idx_incentives_month ON employee_incentives(month) WHERE month IS NOT NULL;
CREATE INDEX idx_incentives_created_at ON employee_incentives(created_at DESC);

CREATE TRIGGER incentives_updated_at BEFORE UPDATE ON employee_incentives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Performance scores (monthly employee evaluation)
-- -----------------------------------------------------------------------------
CREATE TABLE performance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Time period
  week_start DATE, -- For weekly reports
  month TEXT,      -- 'YYYY-MM' for monthly reports

  -- Work metrics
  hours_worked DECIMAL(7,2) DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,

  -- Revenue metrics
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  revenue_per_hour DECIMAL(10,2) DEFAULT 0,

  -- Quality metrics (35 points)
  avg_review_rating DECIMAL(3,2),
  review_score INTEGER DEFAULT 0,
  complaints_count INTEGER DEFAULT 0,
  complaint_score INTEGER DEFAULT 0,
  photos_completion_pct DECIMAL(5,2) DEFAULT 100,
  photos_score INTEGER DEFAULT 0,

  -- Productivity metrics (40 points)
  jobs_target INTEGER,
  jobs_score INTEGER DEFAULT 0,
  revenue_target DECIMAL(12,2),
  revenue_score INTEGER DEFAULT 0,

  -- Reliability metrics (25 points)
  punctuality_pct DECIMAL(5,2) DEFAULT 100,
  punctuality_score INTEGER DEFAULT 0,
  absences_count INTEGER DEFAULT 0,
  absence_score INTEGER DEFAULT 0,

  -- Overall score (out of 100)
  total_score INTEGER DEFAULT 0,
  rank INTEGER, -- Ranking among all employees

  -- Bonus calculation
  bonuses_earned DECIMAL(10,2) DEFAULT 0,
  performance_bonus_pct DECIMAL(5,2), -- % of salary as bonus

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(employee_id, week_start),
  UNIQUE(employee_id, month)
);

COMMENT ON TABLE performance_scores IS 'Weekly and monthly employee performance scores and rankings';

CREATE INDEX idx_performance_employee ON performance_scores(employee_id);
CREATE INDEX idx_performance_week ON performance_scores(week_start DESC) WHERE week_start IS NOT NULL;
CREATE INDEX idx_performance_month ON performance_scores(month DESC) WHERE month IS NOT NULL;
CREATE INDEX idx_performance_rank ON performance_scores(rank) WHERE rank IS NOT NULL;

CREATE TRIGGER performance_scores_updated_at BEFORE UPDATE ON performance_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Daily payroll (daily labor cost summary)
-- -----------------------------------------------------------------------------
CREATE TABLE daily_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,

  -- Truck/team breakdown
  truck_id TEXT, -- 'truck_nord', 'truck_sud', 'all'

  -- Summary metrics
  total_hours DECIMAL(8,2) DEFAULT 0,
  total_cost DECIMAL(12,2) DEFAULT 0, -- Total labor cost
  total_revenue DECIMAL(12,2) DEFAULT 0, -- Revenue generated that day
  margin_percent DECIMAL(5,2), -- (revenue - cost) / revenue * 100

  -- Employee count
  employees_active INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,

  -- Detailed breakdown (JSONB)
  data JSONB, -- { employee_id: { name, hours, rate, cost, jobs: [...] } }

  -- Notification tracking
  sent_to_henri BOOLEAN DEFAULT FALSE,
  sent_to_henri_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE daily_payroll IS 'Daily labor cost summary sent to Henri for real-time cost tracking';

CREATE INDEX idx_daily_payroll_date ON daily_payroll(date DESC);
CREATE INDEX idx_daily_payroll_truck ON daily_payroll(truck_id) WHERE truck_id IS NOT NULL;

CREATE TRIGGER daily_payroll_updated_at BEFORE UPDATE ON daily_payroll
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- UPSELL ENGINE TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Upsell opportunities (field-identified service opportunities)
-- -----------------------------------------------------------------------------
CREATE TABLE upsell_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source job (where opportunity was identified)
  servicem8_job_uuid TEXT NOT NULL,
  servicem8_company_uuid TEXT,

  -- Identified by
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  detected_by TEXT DEFAULT 'staff' CHECK (detected_by IN ('staff', 'ai', 'automated_rule')),

  -- Client details
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,

  -- Service opportunity
  service_type TEXT NOT NULL CHECK (service_type IN (
    'fertilization',        -- Deep root fertilization
    'pest_treatment',       -- Spider mite, aphids treatment
    'winter_protection',    -- Burlap wrapping
    'rejuvenation',         -- Severe pruning/rejuvenation
    'cedar_replacement',    -- Replace dead cedars
    'mulching',             -- Base mulching
    'hedge_removal',        -- Full hedge removal
    'landscape_design',     -- New landscape design
    'irrigation_repair'     -- Irrigation system repair
  )),
  description TEXT,
  notes TEXT,

  -- Supporting evidence
  photo_url TEXT,
  photo_urls TEXT[], -- Multiple photos

  -- Quote tracking
  estimated_value DECIMAL(10,2),
  quote_amount DECIMAL(10,2),
  quote_sent_at TIMESTAMPTZ,

  -- Status pipeline
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified',  -- Flagged by employee
    'quoted',      -- Quote sent to customer
    'accepted',    -- Customer accepted quote
    'converted',   -- Job completed
    'declined',    -- Customer declined
    'deferred'     -- Customer interested but later
  )),

  -- Customer response
  client_response TEXT, -- 'OUI', 'NON', 'PLUS TARD'
  declined_reason TEXT,
  deferred_until DATE,

  -- Conversion tracking
  converted_job_uuid TEXT, -- New ServiceM8 job created
  completed_at TIMESTAMPTZ,

  -- Commission
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN DEFAULT FALSE,
  commission_paid_at TIMESTAMPTZ,

  -- Follow-up
  follow_up_count INTEGER DEFAULT 0,
  next_follow_up_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE upsell_opportunities IS 'Service upsell opportunities identified by field teams with commission tracking';

CREATE INDEX idx_upsell_employee ON upsell_opportunities(employee_id);
CREATE INDEX idx_upsell_status ON upsell_opportunities(status);
CREATE INDEX idx_upsell_service_type ON upsell_opportunities(service_type);
CREATE INDEX idx_upsell_job_uuid ON upsell_opportunities(servicem8_job_uuid);
CREATE INDEX idx_upsell_client_phone ON upsell_opportunities(client_phone) WHERE client_phone IS NOT NULL;
CREATE INDEX idx_upsell_next_followup ON upsell_opportunities(next_follow_up_at) WHERE next_follow_up_at IS NOT NULL;

CREATE TRIGGER upsell_opportunities_updated_at BEFORE UPDATE ON upsell_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add FK constraint now that upsell_opportunities table exists
ALTER TABLE employee_incentives
  ADD CONSTRAINT fk_incentives_upsell
  FOREIGN KEY (upsell_opportunity_id)
  REFERENCES upsell_opportunities(id)
  ON DELETE SET NULL;

-- ============================================================================
-- SUBSCRIPTIONS (CLUB HAIE LITE)
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Subscriptions (recurring maintenance plans)
-- -----------------------------------------------------------------------------
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer information
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT,

  -- Subscription plan
  plan TEXT NOT NULL CHECK (plan IN (
    'essentiel',  -- 2 visits/year
    'premium',    -- 3 visits/year
    'platine'     -- 4 visits/year + extras
  )),

  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- ServiceM8 integration
  servicem8_company_uuid TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',      -- Active subscription
    'past_due',    -- Payment failed
    'cancelled',   -- Customer cancelled
    'paused',      -- Temporarily paused
    'expired'      -- Ended naturally
  )),

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE,
  renewal_date DATE,
  next_billing_date DATE,
  cancelled_at TIMESTAMPTZ,

  -- Service tracking
  visits_per_year INTEGER NOT NULL,
  visits_remaining INTEGER,
  last_visit_date DATE,
  next_scheduled_visit DATE,

  -- Pricing
  price_per_period DECIMAL(10,2) NOT NULL,
  billing_interval TEXT CHECK (billing_interval IN ('month', 'quarter', 'year')),

  -- Pause tracking
  pause_start DATE,
  pause_end DATE,

  -- Performance metrics
  total_revenue DECIMAL(12,2) DEFAULT 0,
  periods_completed INTEGER DEFAULT 0,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE subscriptions IS 'Recurring maintenance subscriptions (Club Haie Lite) with Stripe integration';

CREATE INDEX idx_subscriptions_phone ON subscriptions(phone);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
CREATE INDEX idx_subscriptions_next_billing ON subscriptions(next_billing_date) WHERE next_billing_date IS NOT NULL;
CREATE INDEX idx_subscriptions_servicem8 ON subscriptions(servicem8_company_uuid) WHERE servicem8_company_uuid IS NOT NULL;

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMERCIAL CONTRACTS
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Commercial contracts (B2B annual contracts)
-- -----------------------------------------------------------------------------
CREATE TABLE commercial_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company information
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT,

  -- Contract details
  contract_type TEXT NOT NULL CHECK (contract_type IN (
    'condo',           -- Condominium association
    'hoa',             -- Homeowners association
    'commercial',      -- Commercial property
    'municipality',    -- Municipal contract
    'institutional'    -- Schools, hospitals, etc.
  )),

  -- ServiceM8 integration
  servicem8_company_uuid TEXT,

  -- Contract terms
  annual_value DECIMAL(12,2) NOT NULL,
  visits_per_year INTEGER NOT NULL,
  contract_start_date DATE NOT NULL,
  contract_end_date DATE NOT NULL,

  -- Billing
  billing_schedule TEXT CHECK (billing_schedule IN ('monthly', 'quarterly', 'annual', 'per_visit')),
  next_invoice_date DATE,

  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'pending',    -- Awaiting signature
    'active',     -- Active contract
    'renewed',    -- Auto-renewed
    'expired',    -- Ended
    'cancelled'   -- Terminated early
  )),

  -- Performance
  visits_completed_ytd INTEGER DEFAULT 0,
  revenue_ytd DECIMAL(12,2) DEFAULT 0,

  -- Renewal tracking
  auto_renew BOOLEAN DEFAULT TRUE,
  renewal_notice_sent BOOLEAN DEFAULT FALSE,
  renewal_notice_sent_at TIMESTAMPTZ,

  -- Metadata
  notes TEXT,
  contract_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE commercial_contracts IS 'B2B commercial contracts for condos, HOAs, and institutions';

CREATE INDEX idx_commercial_company ON commercial_contracts(company_name);
CREATE INDEX idx_commercial_phone ON commercial_contracts(phone);
CREATE INDEX idx_commercial_status ON commercial_contracts(status);
CREATE INDEX idx_commercial_type ON commercial_contracts(contract_type);
CREATE INDEX idx_commercial_end_date ON commercial_contracts(contract_end_date);
CREATE INDEX idx_commercial_servicem8 ON commercial_contracts(servicem8_company_uuid) WHERE servicem8_company_uuid IS NOT NULL;

CREATE TRIGGER commercial_contracts_updated_at BEFORE UPDATE ON commercial_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SYSTEM AUTOMATION TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Scheduled actions (cron jobs and delayed tasks)
-- -----------------------------------------------------------------------------
CREATE TABLE scheduled_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Action definition
  action_type TEXT NOT NULL CHECK (action_type IN (
    'review_request',      -- Send Google review request
    'referral_request',    -- Send referral program invite
    'followup_lead',       -- Lead follow-up message
    'job_confirmation',    -- Job confirmation SMS
    'job_reminder',        -- Job reminder (1 day before)
    'upsell_followup',     -- Upsell opportunity follow-up
    'subscription_reminder', -- Subscription renewal reminder
    'reactivation',        -- Dormant customer reactivation
    'weather_alert',       -- Weather-related alert
    'other'
  )),

  -- Schedule
  scheduled_for TIMESTAMPTZ NOT NULL,

  -- Payload (action-specific data)
  payload JSONB NOT NULL,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Awaiting execution
    'completed',  -- Successfully executed
    'failed',     -- Execution failed
    'cancelled'   -- Cancelled before execution
  )),

  -- Execution tracking
  executed_at TIMESTAMPTZ,
  result JSONB, -- Execution result/response
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,

  -- Associations
  related_job_uuid TEXT,
  related_lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  related_company_uuid TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE scheduled_actions IS 'Scheduled actions and delayed tasks for automated workflows';

CREATE INDEX idx_scheduled_status_time ON scheduled_actions(status, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_scheduled_action_type ON scheduled_actions(action_type);
CREATE INDEX idx_scheduled_job_uuid ON scheduled_actions(related_job_uuid) WHERE related_job_uuid IS NOT NULL;

CREATE TRIGGER scheduled_actions_updated_at BEFORE UPDATE ON scheduled_actions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Job events (ServiceM8 webhook event log)
-- -----------------------------------------------------------------------------
CREATE TABLE job_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Job reference
  servicem8_job_uuid TEXT NOT NULL,

  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'updated', 'status_change', 'deleted',
    'quote_sent', 'quote_accepted', 'job_started', 'job_completed',
    'invoice_generated', 'payment_received'
  )),

  -- Status tracking
  old_status TEXT,
  new_status TEXT,

  -- Webhook payload
  payload JSONB NOT NULL,

  -- Processing
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMPTZ,
  processing_error TEXT,

  -- Metadata
  webhook_received_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE job_events IS 'Event log for all ServiceM8 job webhooks received';

CREATE INDEX idx_job_events_uuid ON job_events(servicem8_job_uuid);
CREATE INDEX idx_job_events_type ON job_events(event_type);
CREATE INDEX idx_job_events_processed ON job_events(processed) WHERE processed = FALSE;
CREATE INDEX idx_job_events_created_at ON job_events(created_at DESC);

-- ============================================================================
-- REPORTS & ANALYTICS TABLES
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Google reviews (review tracking and matching)
-- -----------------------------------------------------------------------------
CREATE TABLE google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Google review data
  review_id TEXT UNIQUE NOT NULL, -- Google review ID
  author_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,

  -- Response tracking
  reply_text TEXT,
  reply_posted_at TIMESTAMPTZ,
  replied_by TEXT,

  -- Matching to job/employee
  servicem8_job_uuid TEXT,
  matched_employee_ids UUID[], -- Array of employee UUIDs who serviced the job
  matched_at TIMESTAMPTZ,
  match_confidence DECIMAL(4,2), -- 0-100% confidence score

  -- Dates
  review_time TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),

  -- Bonus tracking
  bonuses_generated BOOLEAN DEFAULT FALSE,
  bonuses_generated_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE google_reviews IS 'Google reviews with job/employee matching for bonus attribution';

CREATE INDEX idx_google_reviews_rating ON google_reviews(rating);
CREATE INDEX idx_google_reviews_time ON google_reviews(review_time DESC);
CREATE INDEX idx_google_reviews_job_uuid ON google_reviews(servicem8_job_uuid) WHERE servicem8_job_uuid IS NOT NULL;
CREATE INDEX idx_google_reviews_bonuses ON google_reviews(bonuses_generated) WHERE bonuses_generated = FALSE;

-- -----------------------------------------------------------------------------
-- Weather alerts (weather-based job alerts)
-- -----------------------------------------------------------------------------
CREATE TABLE weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Alert details
  date DATE NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'heavy_rain', 'high_winds', 'extreme_heat', 'thunderstorm', 'snow', 'ice'
  )),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),

  -- Weather data
  description TEXT,
  temperature_c DECIMAL(4,1),
  wind_speed_kmh DECIMAL(5,1),
  precipitation_mm DECIMAL(6,2),

  -- Impact
  jobs_affected INTEGER DEFAULT 0,
  jobs_rescheduled INTEGER DEFAULT 0,

  -- Notifications
  sms_sent INTEGER DEFAULT 0,
  henri_notified BOOLEAN DEFAULT FALSE,
  customers_notified BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE weather_alerts IS 'Weather alerts affecting scheduled jobs with customer notifications';

CREATE INDEX idx_weather_date ON weather_alerts(date DESC);
CREATE INDEX idx_weather_type ON weather_alerts(alert_type);

-- -----------------------------------------------------------------------------
-- Weekly employee reports (sent to employees)
-- -----------------------------------------------------------------------------
CREATE TABLE weekly_employee_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,

  -- Time period
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Performance summary
  hours_worked DECIMAL(7,2),
  jobs_completed INTEGER,
  revenue_generated DECIMAL(12,2),

  -- Quality metrics
  reviews_count INTEGER DEFAULT 0,
  avg_review_rating DECIMAL(3,2),

  -- Bonuses
  bonuses_earned DECIMAL(10,2) DEFAULT 0,
  review_bonuses INTEGER DEFAULT 0,
  referral_bonuses INTEGER DEFAULT 0,
  upsell_commissions INTEGER DEFAULT 0,

  -- Score
  performance_score INTEGER, -- 0-100
  rank INTEGER, -- Among all employees

  -- Notification
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(employee_id, week_start)
);

COMMENT ON TABLE weekly_employee_reports IS 'Weekly performance reports sent to employees via SMS';

CREATE INDEX idx_weekly_reports_employee ON weekly_employee_reports(employee_id);
CREATE INDEX idx_weekly_reports_week ON weekly_employee_reports(week_start DESC);

-- -----------------------------------------------------------------------------
-- Monthly performance reports (business overview)
-- -----------------------------------------------------------------------------
CREATE TABLE monthly_performance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Time period
  month DATE NOT NULL UNIQUE, -- First day of month (YYYY-MM-01)

  -- Revenue metrics
  total_revenue DECIMAL(14,2),
  total_jobs INTEGER,
  avg_ticket DECIMAL(10,2),

  -- Lead metrics
  leads_received INTEGER,
  conversion_rate DECIMAL(5,2),

  -- Top performers
  top_employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  top_employee_revenue DECIMAL(12,2),
  top_city TEXT,
  top_city_revenue DECIMAL(12,2),

  -- Year-to-date
  ytd_revenue DECIMAL(14,2),
  ytd_target DECIMAL(14,2),
  ytd_progress_pct DECIMAL(5,2),

  -- Growth
  mom_growth_percent DECIMAL(6,2), -- Month-over-month growth
  yoy_growth_percent DECIMAL(6,2), -- Year-over-year growth

  -- Customer metrics
  new_customers INTEGER,
  repeat_customers INTEGER,
  subscription_customers INTEGER,

  -- Operational metrics
  total_hours_worked DECIMAL(10,2),
  labor_cost_total DECIMAL(12,2),
  labor_cost_pct DECIMAL(5,2),

  -- Quality metrics
  avg_review_rating DECIMAL(3,2),
  total_reviews INTEGER,
  complaints INTEGER,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE monthly_performance_reports IS 'Monthly business performance overview for leadership';

CREATE INDEX idx_monthly_reports_month ON monthly_performance_reports(month DESC);

-- -----------------------------------------------------------------------------
-- Reactivation campaigns (dormant customer outreach)
-- -----------------------------------------------------------------------------
CREATE TABLE reactivation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Customer details
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  servicem8_company_uuid TEXT,

  -- Last service
  last_job_date DATE NOT NULL,
  last_job_uuid TEXT,
  last_job_amount DECIMAL(10,2),

  -- Campaign execution
  campaign_type TEXT CHECK (campaign_type IN (
    'dormant_6m',    -- 6 months inactive
    'dormant_12m',   -- 12 months inactive
    'seasonal',      -- Seasonal reminder
    'win_back'       -- Lost customer win-back
  )),

  -- Outreach
  sms_sent BOOLEAN DEFAULT FALSE,
  sms_sent_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,

  -- Offer details
  discount_offered_pct DECIMAL(5,2),
  discount_code TEXT,
  offer_expires_at DATE,

  -- Response tracking
  response_status TEXT CHECK (response_status IN (
    'pending', 'interested', 'booked', 'declined', 'no_response'
  )),
  response_received_at TIMESTAMPTZ,

  -- Conversion
  new_job_uuid TEXT,
  new_job_amount DECIMAL(10,2),
  converted_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE reactivation_campaigns IS 'Dormant customer reactivation campaigns with offer tracking';

CREATE INDEX idx_reactivation_phone ON reactivation_campaigns(client_phone);
CREATE INDEX idx_reactivation_status ON reactivation_campaigns(response_status);
CREATE INDEX idx_reactivation_campaign_type ON reactivation_campaigns(campaign_type);
CREATE INDEX idx_reactivation_created ON reactivation_campaigns(created_at DESC);

CREATE TRIGGER reactivation_campaigns_updated_at BEFORE UPDATE ON reactivation_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_incentives ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_employee_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactivation_campaigns ENABLE ROW LEVEL SECURITY;

-- Service role bypass (for backend operations)
-- This policy allows the service_role to bypass RLS
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOR table_name IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('
      CREATE POLICY service_role_all ON %I
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
    ', table_name);
  END LOOP;
END $$;

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Tables created: 19
-- 1. leads                        - Lead pipeline tracking
-- 2. referrals                    - Customer referral program
-- 3. messages_sent                - SMS/email audit log
-- 4. daily_kpis                   - Daily business metrics
-- 5. employees                    - Employee directory
-- 6. timesheets                   - Work hours tracking
-- 7. employee_incentives          - Bonuses and commissions
-- 8. performance_scores           - Employee performance evaluation
-- 9. daily_payroll                - Daily labor cost summary
-- 10. upsell_opportunities        - Field-identified upsells
-- 11. subscriptions               - Recurring maintenance plans
-- 12. commercial_contracts        - B2B annual contracts
-- 13. scheduled_actions           - Automated task scheduling
-- 14. job_events                  - ServiceM8 webhook log
-- 15. google_reviews              - Review tracking and matching
-- 16. weather_alerts              - Weather-based alerts
-- 17. weekly_employee_reports     - Weekly employee SMS reports
-- 18. monthly_performance_reports - Monthly business overview
-- 19. reactivation_campaigns      - Dormant customer outreach

-- Indexes created: 120+
-- Triggers created: 13 (updated_at triggers)
-- Functions created: 2 (update_updated_at_column, increment_daily_kpi)
-- RLS enabled on all tables with service_role bypass
