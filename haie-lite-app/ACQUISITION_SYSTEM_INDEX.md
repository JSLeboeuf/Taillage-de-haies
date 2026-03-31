# Acquisition Outreach System — Complete Index

## Overview

Automated multi-touch email campaigns for B2B SaaS acquisition. 4 configurable sequences (cold, warm, blast, nurture) delivering 14 total emails over 22 days to 6 months.

**Status:** Production-ready (Mar 31, 2026)
**Cron Schedule:** Monday-Friday 14:00 UTC (10:00 EDT)
**Max Batch:** 20 prospects/execution
**Email Provider:** Resend

---

## Core Implementation Files

### Route Handler

- **File:** `/app/api/cron/acquisition-outreach/route.ts` (228 lines)
- **Purpose:** HTTP endpoint for cron job
- **Key Functions:**
  - `GET()` — Main cron handler
  - Query prospects ready for email
  - Send via Resend
  - Log to 3 Supabase tables
  - Return JSON with metrics
- **Authorization:** Bearer token (CRON_SECRET)
- **Response Format:** `{ processed, sent, errors }`

### Email Templates & Sequencing

- **File:** `/lib/acquisition-emails.ts` (327 lines)
- **Purpose:** Email templates + timing logic
- **Exports:**
  - `getAcquisitionEmail()` — Get template by sequence type + step
  - `getNextEmailDelay()` — Calculate delay to next email (in days)
  - `isSequenceComplete()` — Check if sequence finished
  - `getSequenceCompletionDate()` — Estimate completion date
  - `AcquisitionProspect` interface
- **Sequences Included:**
  - Cold (5 emails, 22 days)
  - Warm (4 emails, 12 days)
  - Blast (3 emails, 2 days)
  - Nurture (2 emails, quarterly)

---

## Database Schema

### Migration File

- **File:** `/supabase/migrations/005_acquisition_system.sql` (67 lines)
- **Tables Created:**
  1. `acquisition_prospects` — Prospect CRM + campaign state
  2. `acquisition_emails` — Audit log of sent emails
  3. `acquisition_activities` — Detailed activity tracking
- **Indexes:** 9 indexes for performance
- **RLS:** Enabled (optional policies)

### Table Details

#### acquisition_prospects

| Column             | Type      | Purpose                                                       |
| ------------------ | --------- | ------------------------------------------------------------- |
| id                 | UUID      | Primary key                                                   |
| company_name       | TEXT      | Prospect company                                              |
| contact_email      | TEXT      | Email recipient                                               |
| owner_email        | TEXT      | Sales rep owner                                               |
| sequence_type      | ENUM      | cold / warm / blast / nurture                                 |
| sequence_step      | INT       | Current step (0-5)                                            |
| priority           | INT       | Sort order in batch                                           |
| status             | ENUM      | new / contacted / qualified / nurture / closed\_\* / archived |
| next_email_at      | TIMESTAMP | When to send next email                                       |
| last_email_sent_at | TIMESTAMP | Last email send time                                          |
| created_at         | TIMESTAMP | Prospect creation                                             |
| metadata           | JSONB     | Custom data (UTM params, etc)                                 |

#### acquisition_emails

| Column         | Type      | Purpose                         |
| -------------- | --------- | ------------------------------- |
| id             | UUID      | Primary key                     |
| prospect_id    | UUID      | FK to prospects                 |
| prospect_email | TEXT      | Email address                   |
| sequence_type  | TEXT      | Type of sequence                |
| sequence_step  | INT       | Email number in sequence        |
| subject        | TEXT      | Email subject line              |
| email_id       | TEXT      | Resend email ID                 |
| sent_at        | TIMESTAMP | When email was sent             |
| opened_at      | TIMESTAMP | When opened (via webhook)       |
| clicked_at     | TIMESTAMP | When link clicked (via webhook) |
| bounced        | BOOLEAN   | Bounced? (via webhook)          |

#### acquisition_activities

| Column      | Type      | Purpose                                                                  |
| ----------- | --------- | ------------------------------------------------------------------------ |
| id          | UUID      | Primary key                                                              |
| prospect_id | UUID      | FK to prospects                                                          |
| type        | ENUM      | email_sent / sequence_complete / error / reply_received / meeting_booked |
| description | TEXT      | Human-readable activity                                                  |
| metadata    | JSONB     | Additional context                                                       |
| created_at  | TIMESTAMP | When activity occurred                                                   |

---

## Configuration

### Vercel Configuration

- **File:** `/vercel.json`
- **Addition:** Cron schedule entry
- **Schedule:** `0 14 * * 1-5` (Mon-Fri 14:00 UTC)
- **Path:** `/api/cron/acquisition-outreach`

### Environment Variables Required

```
CRON_SECRET=<random-secure-string>
RESEND_API_KEY=re_<api_key>
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Documentation Files

### Quick Start Guide

- **File:** `/docs/ACQUISITION_INTEGRATION.md` (270 lines)
- **Contents:**
  - 5-minute setup instructions
  - Testing locally
  - Adding test prospects
  - Architecture overview
  - Monitoring queries
  - Troubleshooting

### Detailed Setup

- **File:** `ACQUISITION-OUTREACH-SETUP.md` (270 lines)
- **Contents:**
  - Table schemas with SQL
  - Email sequence descriptions
  - Cron authorization details
  - Response format
  - Local testing
  - Monitoring queries
  - Known limitations
  - Future enhancements

### Email Sequences Reference

- **File:** `/docs/EMAIL_SEQUENCES_REFERENCE.md` (411 lines)
- **Contents:**
  - All 14 email templates detailed
  - Subject lines + purpose
  - Key points for each email
  - HTML design guidelines
  - Tone + personalization rules
  - Performance metrics + targets
  - A/B testing ideas
  - Compliance notes (GDPR/CASL)

---

## Testing

### Unit Tests

- **File:** `/lib/__tests__/acquisition-emails.test.ts` (208 lines)
- **Test Coverage:**
  - All 4 sequences (cold, warm, blast, nurture)
  - Email retrieval by step
  - Delay calculations
  - Sequence completion detection
  - Completion date estimation
  - Email content validation
- **Total Tests:** 20+ assertions
- **Framework:** Jest (standard Next.js)

### Test Script

- **File:** `/scripts/test-acquisition-cron.sh`
- **Purpose:** Integration testing of cron endpoint
- **Tests:**
  - Missing authorization (401)
  - Wrong secret (401)
  - Valid request (200)
  - Response JSON structure
- **Usage:** `./scripts/test-acquisition-cron.sh [secret] [base_url]`

---

## Email Sequences Overview

### Cold Sequence (5 emails, 22 days)

Best for: Completely cold B2B prospects

1. **Step 1 (J+0)** — Expansion Intro
   - Subject: Expansion announcement + company name
   - CTA: 30% cost reduction pitch

2. **Step 2 (J+3)** — Limited Offer
   - Subject: Special partner offer
   - CTA: 15-day limited window

3. **Step 3 (J+7)** — Social Proof
   - Subject: Case studies + proof
   - CTA: View case studies

4. **Step 4 (J+12)** — Last Chance
   - Subject: Final push + calendar
   - CTA: Book launch week slot

5. **Step 5 (J+22)** → Nurture
   - Transition to quarterly nurture program

**Targets:** 18-22% open rate, 0.5-1% conversion

---

### Warm Sequence (4 emails, 12 days)

Best for: Referral-based warm introductions

1. **Step 1 (J+0)** — Warm Intro
   - Subject: Referral introduction
   - CTA: 2-minute pitch

2. **Step 2 (J+2)** — Custom Offer
   - Subject: Personalized proposal
   - CTA: Download PDF

3. **Step 3 (J+5)** — Next Steps
   - Subject: Implementation path
   - CTA: Schedule alignment call

4. **Step 4 (J+12)** → Nurture
   - Transition to quarterly nurture

**Targets:** 30-40% open rate, 5-10% conversion

---

### Blast Sequence (3 emails, 2 days)

Best for: Time-limited urgent campaigns (launches, limited slots)

1. **Step 1 (J+0)** — Urgent Offer
   - Subject: 48-hour countdown
   - CTA: Sign up for limited slots

2. **Step 2 (J+1)** — Last Chance
   - Subject: 24-hour final push
   - CTA: Urgent signup link

3. **Step 3 (J+2)** → Waitlist
   - Offer expired, move to waitlist

**Targets:** 40% open rate, 2-5% conversion

---

### Nurture Sequence (2 emails, quarterly)

Best for: Long-term engagement (not immediate buyers)

1. **Step 1 (Q1)** — Seasonal Update
   - Subject: New seasonal offer
   - CTA: Informational link

2. **Step 2 (Q2)** → Repeat
   - Product updates + innovations
   - Cycle repeats quarterly

**Targets:** 15% open rate, brand awareness

---

## Performance & Monitoring

### Key Metrics to Track

```
Open Rate:        Cold 22%, Warm 35%, Blast 40%
Click-Through:    Cold 3%, Warm 8%, Blast 15%
Conversion Rate:  Cold 0.5-1%, Warm 5-10%, Blast 2-5%
Bounce Rate:      Target <2%
Spam Complaints:  Target <0.5%
```

### Monitoring Queries

```sql
-- Recent activity
SELECT * FROM acquisition_activities WHERE created_at > NOW() - INTERVAL '24 hours';

-- Email send history
SELECT p.company_name, ae.subject, ae.sent_at FROM acquisition_emails ae
JOIN acquisition_prospects p ON ae.prospect_id = p.id
WHERE ae.sent_at > NOW() - INTERVAL '7 days';

-- Error logs
SELECT * FROM acquisition_activities WHERE type = 'error' ORDER BY created_at DESC;

-- Prospects ready for next email
SELECT * FROM acquisition_prospects WHERE next_email_at <= NOW() LIMIT 20;
```

---

## Deployment Checklist

- [ ] Create Supabase tables (run 005_acquisition_system.sql)
- [ ] Set CRON_SECRET environment variable (Vercel)
- [ ] Verify RESEND_API_KEY is set
- [ ] Test cron locally: `npm run dev` + curl
- [ ] Add test prospect to database
- [ ] Verify email sends to contact_email
- [ ] Check activity logged in Supabase
- [ ] Deploy to production: `git push`
- [ ] Verify cron runs on schedule (Vercel dashboard)
- [ ] Monitor first 24 hours (check error logs)

---

## Troubleshooting Quick Reference

| Issue                 | Solution                                              |
| --------------------- | ----------------------------------------------------- |
| Cron not running      | Check Vercel Deployments → CRON_SECRET set?           |
| Emails not sent       | Check `next_email_at <= NOW()`, verify RESEND_API_KEY |
| "Unauthorized" 401    | Verify Bearer token matches CRON_SECRET exactly       |
| Blank email templates | Check sequence_type is cold/warm/blast/nurture        |
| Empty prospect list   | Insert test prospect with `next_email_at = NOW()`     |

---

## Future Enhancements

Priority 1 (Q2 2026):

- [ ] Resend webhook integration (opens, clicks, bounces)
- [ ] Dynamic send time optimization
- [ ] A/B testing on subject lines

Priority 2 (Q3 2026):

- [ ] Reply detection + auto-followup
- [ ] Unsubscribe management
- [ ] Lead scoring integration

Priority 3 (Q4 2026):

- [ ] SMS fallback for non-responders
- [ ] ServiceM8 job context enrichment
- [ ] Machine learning on best sequences

---

## Related Systems

- **ServiceM8 Integration:** `/lib/servicem8.ts`
- **SMS Templates:** `/lib/sms-templates.ts`
- **Lead Follow-up:** `/app/api/cron/lead-followup/route.ts`
- **Upsell System:** `/app/api/upsell/`

---

## Files Summary Table

| File                          | Lines      | Purpose                 | Owner     |
| ----------------------------- | ---------- | ----------------------- | --------- |
| route.ts                      | 228        | Cron endpoint handler   | Backend   |
| acquisition-emails.ts         | 327        | Email templates + logic | Backend   |
| 005_acquisition_system.sql    | 67         | Database schema         | DevOps    |
| vercel.json                   | (modified) | Cron schedule           | DevOps    |
| ACQUISITION_INTEGRATION.md    | 270        | Quick start guide       | Docs      |
| ACQUISITION-OUTREACH-SETUP.md | 270        | Detailed setup          | Docs      |
| EMAIL_SEQUENCES_REFERENCE.md  | 411        | Email details           | Marketing |
| acquisition-emails.test.ts    | 208        | Unit tests              | QA        |
| test-acquisition-cron.sh      | 45         | Integration test        | QA        |
| **Total**                     | **1,826**  | **Complete system**     | **All**   |

---

## Support & Questions

For implementation questions:

1. See `/docs/ACQUISITION_INTEGRATION.md` (quick start)
2. Check `ACQUISITION-OUTREACH-SETUP.md` (detailed)
3. Review `/docs/EMAIL_SEQUENCES_REFERENCE.md` (email details)
4. Run tests: `npm test -- acquisition-emails.test.ts`
5. Check Supabase logs: `SELECT * FROM acquisition_activities ORDER BY created_at DESC`

Last Updated: March 31, 2026
