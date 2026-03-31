# Acquisition Outreach Cron Setup

## Overview

The `acquisition-outreach` cron job automates multi-touch email campaigns for acquisition prospects. It runs **Monday-Friday at 14:00 UTC (10:00 EDT)**.

## Files Created

- `/app/api/cron/acquisition-outreach/route.ts` — Main cron handler
- `/lib/acquisition-emails.ts` — Email templates and sequencing logic
- `vercel.json` — Updated with cron schedule

## Required Supabase Tables

### 1. `acquisition_prospects`

Stores prospect data and campaign state.

```sql
CREATE TABLE acquisition_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  owner_email TEXT NOT NULL,  -- Sales rep or team owner
  sequence_type TEXT NOT NULL CHECK (sequence_type IN ('cold', 'warm', 'blast', 'nurture')),
  sequence_step INT DEFAULT 0,
  priority INT DEFAULT 0,  -- Higher = sent first in batch
  status TEXT NOT NULL CHECK (status IN ('new', 'contacted', 'qualified', 'nurture', 'closed_won', 'closed_lost', 'archived')),
  next_email_at TIMESTAMP WITH TIME ZONE,  -- NULL = no more emails scheduled
  last_email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_acquisition_prospects_next_email ON acquisition_prospects(next_email_at);
CREATE INDEX idx_acquisition_prospects_status ON acquisition_prospects(status);
```

### 2. `acquisition_emails`

Logs every email sent by the cron.

```sql
CREATE TABLE acquisition_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES acquisition_prospects(id) ON DELETE CASCADE,
  prospect_email TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  sequence_type TEXT NOT NULL,
  sequence_step INT NOT NULL,
  subject TEXT NOT NULL,
  email_id TEXT NOT NULL,  -- Resend email ID
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

CREATE INDEX idx_acquisition_emails_prospect ON acquisition_emails(prospect_id);
CREATE INDEX idx_acquisition_emails_sent_at ON acquisition_emails(sent_at);
```

### 3. `acquisition_activities`

Detailed activity log for auditing and analytics.

```sql
CREATE TABLE acquisition_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES acquisition_prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email_sent', 'sequence_complete', 'error', 'reply_received', 'meeting_booked')),
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_acquisition_activities_prospect ON acquisition_activities(prospect_id);
CREATE INDEX idx_acquisition_activities_type ON acquisition_activities(type);
```

## Email Sequences

### Cold Sequence (5 emails over ~22 days)

- **Step 1** (J+0): Expansion intro + benefits
- **Step 2** (J+3): Limited time offer
- **Step 3** (J+7): Social proof + case studies
- **Step 4** (J+12): Last chance + calendar slots
- **Step 5** (J+22): Move to nurture program (quarterly)

### Warm Sequence (4 emails over ~12 days)

- **Step 1** (J+0): Warm introduction + referral context
- **Step 2** (J+2): Custom offer
- **Step 3** (J+5): Next steps + calendar
- **Step 4** (J+12): Final followup → nurture

### Blast Sequence (3 emails over ~2 days)

- **Step 1** (J+0): 48h limited offer
- **Step 2** (J+1): Last chance (24h left)
- **Step 3** (J+2): Offer expired → waitlist

### Nurture Sequence (Ongoing, quarterly)

- **Step 1** (Q1): Seasonal offers / updates
- **Step 2** (Q2): Feature releases / case studies

## Cron Authorization

The cron endpoint requires:

```
Authorization: Bearer ${CRON_SECRET}
```

Ensure `CRON_SECRET` is set in your Vercel environment variables.

## Response Format

```json
{
  "processed": 20,
  "sent": 18,
  "errors": ["Prospect uuid-1: Failed to update prospect..."]
}
```

## Testing the Cron Locally

```bash
# Start dev server
npm run dev

# In another terminal, call the endpoint
curl -H "Authorization: Bearer your-cron-secret" \
  http://localhost:3000/api/cron/acquisition-outreach
```

## Monitoring

Check activity logs in Supabase:

```sql
SELECT * FROM acquisition_activities
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

Check email send status:

```sql
SELECT
  p.company_name,
  p.sequence_type,
  p.sequence_step,
  COUNT(*) as emails_sent
FROM acquisition_emails ae
JOIN acquisition_prospects p ON ae.prospect_id = p.id
WHERE ae.sent_at > NOW() - INTERVAL '7 days'
GROUP BY p.company_name, p.sequence_type, p.sequence_step
ORDER BY ae.sent_at DESC;
```

## Email Configuration

- **From:** Jean-Samuel Leboeuf <js@haielite.ca>
- **Provider:** Resend
- **Provider Key:** RESEND_API_KEY environment variable

## Known Limitations

1. Max 20 prospects processed per cron execution (prevents timeout)
2. One email per prospect per execution
3. No A/B testing on subject lines (all prospects get same template)
4. Email open/click tracking requires Resend webhook integration

## Future Enhancements

- [ ] Webhook integration for email opens/clicks
- [ ] Dynamic subject line A/B testing
- [ ] ML-based optimal send time detection
- [ ] Reply detection + auto-follow-up
- [ ] Unsubscribe management
