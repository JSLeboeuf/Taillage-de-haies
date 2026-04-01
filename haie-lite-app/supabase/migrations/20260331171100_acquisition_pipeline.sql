-- ============================================================================
-- Haie Lite M&A Acquisition Pipeline Schema
-- Created: 2026-03-31
-- Description: Complete database schema for B2B acquisition and M&A pipeline
-- ============================================================================

-- ============================================================================
-- ACQUISITION PROSPECTS TABLE
-- ============================================================================

-- Main prospect tracking table for M&A pipeline
CREATE TABLE acquisition_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Company information
  company_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT,
  owner_phone TEXT,
  website TEXT,
  address TEXT,

  -- Territory classification
  territory TEXT CHECK (territory IN (
    'rive-sud', 'rive-nord', 'monteregie', 'laurentides', 'lanaudiere', 'montreal'
  )),

  -- Lead source and acquisition channel
  source TEXT NOT NULL DEFAULT 'other' CHECK (source IN (
    'google_maps', 'pages_jaunes', 'rbq', 'referral', 'kijiji',
    'network', 'blast', 'other'
  )),
  referred_by TEXT,

  -- Business estimation
  estimated_age_years INTEGER,
  estimated_employees INTEGER,
  estimated_revenue NUMERIC(12,2),
  estimated_profit NUMERIC(12,2),
  equipment_notes TEXT,

  -- Online reputation
  google_rating NUMERIC(3,2),
  google_reviews_count INTEGER,

  -- Owner profiling (seller motivation analysis)
  owner_age_estimate TEXT CHECK (owner_age_estimate IN (
    '50-55', '55-60', '60-65', '65-70', '70+', 'unknown'
  )),
  motivation TEXT CHECK (motivation IN (
    'retirement', 'burnout', 'career_change', 'health', 'divorce',
    'partner_conflict', 'cant_sell', 'unknown'
  )),

  -- Pipeline status
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'responded', 'call_scheduled', 'call_done',
    'docs_requested', 'docs_received', 'offer_sent', 'negotiating',
    'loi_signed', 'due_diligence', 'closed_won', 'closed_lost',
    'nurture', 'archived'
  )),

  -- Sequence automation
  sequence_type TEXT CHECK (sequence_type IN (
    'cold', 'warm', 'hot', 'nurture', 'referral', 'career_change',
    'blast', 'reactivation', 'partnership'
  )),
  sequence_step INTEGER DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  next_email_at TIMESTAMPTZ,

  -- Contact tracking
  last_contact_at TIMESTAMPTZ,
  next_followup_at TIMESTAMPTZ,
  call_notes TEXT,

  -- Offer tracking
  offer_plan_a NUMERIC(12,2),
  offer_plan_b NUMERIC(12,2),
  deal_structure TEXT,

  -- Priority and tagging
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  tags TEXT[] DEFAULT '{}',

  -- General notes
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE acquisition_prospects IS 'M&A acquisition prospect pipeline with lead sourcing, qualification, and offer tracking';

-- Indexes for acquisition_prospects
CREATE INDEX idx_acquisition_prospects_status ON acquisition_prospects(status);
CREATE INDEX idx_acquisition_prospects_next_email ON acquisition_prospects(next_email_at)
  WHERE next_email_at IS NOT NULL;
CREATE INDEX idx_acquisition_prospects_sequence_type ON acquisition_prospects(sequence_type);
CREATE INDEX idx_acquisition_prospects_territory ON acquisition_prospects(territory);
CREATE INDEX idx_acquisition_prospects_source ON acquisition_prospects(source);
CREATE INDEX idx_acquisition_prospects_priority ON acquisition_prospects(priority);
CREATE INDEX idx_acquisition_prospects_owner_phone ON acquisition_prospects(owner_phone)
  WHERE owner_phone IS NOT NULL;

-- Trigger for updated_at
CREATE TRIGGER acquisition_prospects_updated_at BEFORE UPDATE ON acquisition_prospects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ACQUISITION EMAILS TABLE
-- ============================================================================

-- Email sequence tracking for each prospect
CREATE TABLE acquisition_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES acquisition_prospects(id) ON DELETE CASCADE,

  -- Email classification
  sequence_type TEXT NOT NULL,
  sequence_step INTEGER NOT NULL,

  -- Email content
  subject TEXT NOT NULL,
  body_text TEXT NOT NULL,
  body_html TEXT,

  -- Delivery tracking
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  resend_id TEXT,

  -- Engagement tracking
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'sent' CHECK (status IN (
    'sent', 'delivered', 'opened', 'replied', 'bounced', 'failed'
  ))
);

COMMENT ON TABLE acquisition_emails IS 'Email sequence tracking for M&A prospect outreach with engagement metrics';

-- Indexes for acquisition_emails
CREATE INDEX idx_acquisition_emails_prospect ON acquisition_emails(prospect_id);
CREATE INDEX idx_acquisition_emails_sent_at ON acquisition_emails(sent_at DESC);
CREATE INDEX idx_acquisition_emails_status ON acquisition_emails(status);
CREATE INDEX idx_acquisition_emails_sequence ON acquisition_emails(sequence_type, sequence_step);

-- ============================================================================
-- ACQUISITION ACTIVITIES TABLE
-- ============================================================================

-- Activity audit log for each prospect interaction
CREATE TABLE acquisition_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES acquisition_prospects(id) ON DELETE CASCADE,

  -- Activity classification
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'email_sent', 'email_opened', 'email_replied', 'call_made', 'call_received',
    'meeting_scheduled', 'meeting_done', 'docs_requested', 'docs_received',
    'offer_sent', 'loi_sent', 'note_added', 'status_changed'
  )),

  -- Activity details
  description TEXT,
  metadata JSONB DEFAULT '{}',

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE acquisition_activities IS 'Complete activity audit log for M&A prospect interactions and pipeline progression';

-- Indexes for acquisition_activities
CREATE INDEX idx_acquisition_activities_prospect ON acquisition_activities(prospect_id);
CREATE INDEX idx_acquisition_activities_created_at ON acquisition_activities(created_at DESC);
CREATE INDEX idx_acquisition_activities_type ON acquisition_activities(activity_type);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on acquisition tables
ALTER TABLE acquisition_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_activities ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies for acquisition tables
CREATE POLICY service_role_all_acquisition_prospects ON acquisition_prospects
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_all_acquisition_emails ON acquisition_emails
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY service_role_all_acquisition_activities ON acquisition_activities
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Tables created: 3
-- 1. acquisition_prospects    - M&A prospect pipeline and qualification
-- 2. acquisition_emails       - Email sequence tracking and engagement
-- 3. acquisition_activities   - Activity audit log for interactions

-- Indexes created: 12
-- Triggers created: 1 (updated_at on acquisition_prospects)
-- RLS enabled on all 3 tables with service_role bypass
