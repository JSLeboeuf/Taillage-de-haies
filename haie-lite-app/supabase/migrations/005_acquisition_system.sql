-- Acquisition prospects table
CREATE TABLE IF NOT EXISTS acquisition_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  owner_email TEXT NOT NULL,
  sequence_type TEXT NOT NULL CHECK (sequence_type IN ('cold', 'warm', 'blast', 'nurture')),
  sequence_step INT DEFAULT 0,
  priority INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'nurture', 'closed_won', 'closed_lost', 'archived')),
  next_email_at TIMESTAMP WITH TIME ZONE,
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_acquisition_prospects_next_email ON acquisition_prospects(next_email_at);
CREATE INDEX IF NOT EXISTS idx_acquisition_prospects_status ON acquisition_prospects(status);
CREATE INDEX IF NOT EXISTS idx_acquisition_prospects_owner ON acquisition_prospects(owner_email);

-- Acquisition emails sent (tracking)
CREATE TABLE IF NOT EXISTS acquisition_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES acquisition_prospects(id) ON DELETE CASCADE,
  prospect_email TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  sequence_type TEXT NOT NULL,
  sequence_step INT NOT NULL,
  subject TEXT NOT NULL,
  email_id TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_acquisition_emails_prospect ON acquisition_emails(prospect_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_emails_sent_at ON acquisition_emails(sent_at);
CREATE INDEX IF NOT EXISTS idx_acquisition_emails_email_id ON acquisition_emails(email_id);

-- Acquisition activities (audit log)
CREATE TABLE IF NOT EXISTS acquisition_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES acquisition_prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email_sent', 'sequence_complete', 'error', 'reply_received', 'meeting_booked')),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_acquisition_activities_prospect ON acquisition_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_acquisition_activities_type ON acquisition_activities(type);
CREATE INDEX IF NOT EXISTS idx_acquisition_activities_created_at ON acquisition_activities(created_at);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE acquisition_prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE acquisition_activities ENABLE ROW LEVEL SECURITY;

-- Optional: Grant permissions to service role
GRANT ALL ON acquisition_prospects TO service_role;
GRANT ALL ON acquisition_emails TO service_role;
GRANT ALL ON acquisition_activities TO service_role;
