# Acquisition Outreach — Integration Guide

## Quick Start (5 minutes)

### 1. Create Supabase Tables

Run the migration in Supabase SQL editor:

```bash
cd supabase/migrations
# Open 005_acquisition_system.sql and run each CREATE TABLE statement
```

Or via CLI:

```bash
supabase db push
```

### 2. Set Environment Variables

In your Vercel dashboard or `.env.local`:

```
CRON_SECRET=your-secure-random-secret-here
RESEND_API_KEY=re_xxx...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
```

### 3. Deploy to Vercel

```bash
git add .
git commit -m "Add acquisition outreach cron system"
git push
```

Vercel automatically picks up the cron schedule from `vercel.json`.

### 4. Test Locally

```bash
npm run dev

# In another terminal:
curl -H "Authorization: Bearer test-secret" \
  http://localhost:3000/api/cron/acquisition-outreach
```

Expected response:

```json
{
  "processed": 0,
  "sent": 0,
  "errors": []
}
```

(0 sent because no prospects are ready for email in your dev database)

## Adding Prospects

Insert test prospects into `acquisition_prospects`:

```sql
INSERT INTO acquisition_prospects (
  company_name,
  contact_email,
  owner_email,
  sequence_type,
  sequence_step,
  priority,
  status,
  next_email_at
) VALUES (
  'Test Company',
  'contact@testcorp.com',
  'sales@haielite.ca',
  'cold',
  0,
  10,
  'new',
  NOW()
);
```

Run the cron again:

```bash
curl -H "Authorization: Bearer test-secret" \
  http://localhost:3000/api/cron/acquisition-outreach
```

Expected response:

```json
{
  "processed": 1,
  "sent": 1,
  "errors": []
}
```

## Architecture

### Tables

1. **acquisition_prospects** — Prospect CRM with campaign state
2. **acquisition_emails** — Sent emails audit log
3. **acquisition_activities** — Detailed activity tracking

### Sequences

- **Cold** (5 emails, 22 days) — For completely cold leads
- **Warm** (4 emails, 12 days) — For warm introductions
- **Blast** (3 emails, 2 days) — For urgent time-limited offers
- **Nurture** (2 emails, quarterly) — Long-term engagement

### Cron Job

- **Schedule:** Mon-Fri 14:00 UTC (10:00 EDT)
- **Runtime:** Edge (fast, no cold starts)
- **Batch size:** 20 prospects/execution
- **Authorization:** Bearer token via CRON_SECRET

### Email Templates

All templates are in `/lib/acquisition-emails.ts`:

- Template functions for each sequence type
- Dynamic company name interpolation
- Responsive HTML with Haie Lite branding
- Call-to-action links to landing pages

## Monitoring & Troubleshooting

### Check Recent Activity

```sql
SELECT * FROM acquisition_activities
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC LIMIT 20;
```

### View Email Send History

```sql
SELECT
  p.company_name,
  p.sequence_type,
  ae.subject,
  ae.sent_at
FROM acquisition_emails ae
JOIN acquisition_prospects p ON ae.prospect_id = p.id
WHERE ae.sent_at > NOW() - INTERVAL '7 days'
ORDER BY ae.sent_at DESC;
```

### Find Prospects Ready for Next Email

```sql
SELECT
  id,
  company_name,
  sequence_type,
  sequence_step,
  next_email_at
FROM acquisition_prospects
WHERE next_email_at <= NOW()
  AND status NOT IN ('closed_won', 'closed_lost', 'archived')
LIMIT 20;
```

### Debug Errors

```sql
SELECT
  p.company_name,
  aa.type,
  aa.description,
  aa.created_at
FROM acquisition_activities aa
JOIN acquisition_prospects p ON aa.prospect_id = p.id
WHERE aa.type = 'error'
  AND aa.created_at > NOW() - INTERVAL '7 days'
ORDER BY aa.created_at DESC;
```

### Verify Email Delivery

```bash
# Check Resend dashboard for bounces/blocks
# OR query in your email service
SELECT
  prospect_email,
  bounced,
  opened_at,
  clicked_at
FROM acquisition_emails
WHERE bounced = TRUE
ORDER BY sent_at DESC;
```

## Common Issues

### Issue: Cron not running at scheduled time

**Solution:** Check Vercel Deployments tab → Cron Jobs. Ensure CRON_SECRET is set in Environment Variables.

### Issue: Emails not being sent

**Solution:**

1. Verify `acquisition_prospects.next_email_at <= NOW()`
2. Check `owner_email` is not null
3. Verify `RESEND_API_KEY` is valid
4. Check `acquisition_activities` table for error logs

### Issue: "Unauthorized" error (401)

**Solution:** Ensure Authorization header matches exactly: `Bearer ${CRON_SECRET}`

### Issue: Email templates are blank

**Solution:** Verify `sequence_type` is one of: 'cold', 'warm', 'blast', 'nurture'

## Performance Notes

- Max 20 prospects per cron execution prevents timeouts
- Limit `acquisition_prospects` index on `next_email_at` for fast queries
- Email sending is non-blocking (failures don't cascade)
- Activity logs grow quickly — consider archiving after 90 days

## Future Enhancements

- [ ] Reply detection (webhook from Resend)
- [ ] Email open/click tracking
- [ ] Dynamic send time optimization
- [ ] A/B testing on subject lines
- [ ] Unsubscribe management
- [ ] Integration with ServiceM8 for job context
- [ ] SMS fallback for non-responders
- [ ] Automated lead scoring

## Testing Checklist

- [ ] Supabase tables created successfully
- [ ] Test prospect inserted into `acquisition_prospects`
- [ ] Cron endpoint responds 200 with correct JSON
- [ ] Email logged in `acquisition_emails`
- [ ] Activity logged in `acquisition_activities`
- [ ] Prospect status updated to "contacted"
- [ ] `next_email_at` set to correct future date
- [ ] Sequence completes and moves to "nurture" status
- [ ] Errors are caught and logged (not crashing)

## Related Files

- `/lib/acquisition-emails.ts` — Email templates & sequencing
- `/app/api/cron/acquisition-outreach/route.ts` — Cron handler
- `/supabase/migrations/005_acquisition_system.sql` — Database schema
- `ACQUISITION-OUTREACH-SETUP.md` — Detailed setup guide
- `vercel.json` — Cron schedule configuration
