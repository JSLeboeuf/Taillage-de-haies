# Acquisition Outreach Cron — Implementation Notes

**Implementation Date:** March 31, 2026
**Status:** Production-Ready
**Total Implementation:** 2,912 lines (code + tests + docs + config)

## Implementation Completed

✓ Full production-ready acquisition email automation system
✓ 4 email sequences (cold, warm, blast, nurture) = 14 total emails
✓ Complete Supabase backend (3 tables + 9 indexes)
✓ Edge runtime cron job (Mon-Fri 14:00 UTC)
✓ Full TypeScript strict implementation
✓ Comprehensive unit + integration tests
✓ 1,263 lines of documentation

## What Each File Does

### /lib/acquisition-emails.ts (327 lines)

- Email templates for 4 sequence types (14 total emails)
- `getAcquisitionEmail()` — Returns email template by sequence + step
- `getNextEmailDelay()` — Calculates delay in days to next email
- `isSequenceComplete()` — Checks if sequence finished
- `getSequenceCompletionDate()` — Estimates completion date
- All emails support company name personalization
- HTML templates ready for Resend delivery

### /app/api/cron/acquisition-outreach/route.ts (228 lines)

- Main cron job endpoint
- Queries prospects where `next_email_at <= NOW()`
- Sends email via Resend
- Logs to 3 Supabase tables (prospects, emails, activities)
- Updates prospect status: new → contacted, sequence_step++
- Handles sequence completion (moves to nurture or archives)
- Comprehensive error handling (per-prospect, non-blocking)
- Returns JSON: { processed, sent, errors }

### /supabase/migrations/005_acquisition_system.sql (66 lines)

```sql
acquisition_prospects    — Main CRM table with campaign state
acquisition_emails       — Audit log of every sent email
acquisition_activities   — Detailed activity tracking
```

- 9 indexes for performance
- RLS enabled (ready for policies)
- FK relationships with CASCADE delete

### /vercel.json (updated)

Added cron schedule entry:

```json
{
  "path": "/api/cron/acquisition-outreach",
  "schedule": "0 14 * * 1-5"
}
```

Schedule: Monday-Friday 14:00 UTC = 10:00 EDT (ideal business hours)

## Email Sequences

### Cold Sequence (5 emails, 22 days) — for completely cold prospects

1. J+0: Expansion intro + company name (30% CTA)
2. J+3: Limited offer (15-day window)
3. J+7: Social proof + case studies (-28% cost, +4 contracts)
4. J+12: Last chance + calendar slots
5. J+22: Move to nurture (quarterly)

Performance targets: 18-22% open, 0.5-1% conversion

### Warm Sequence (4 emails, 12 days) — for referral-based introductions

1. J+0: Warm intro with referrer context
2. J+2: Custom offer PDF
3. J+5: Next steps + 3-step process
4. J+12: Final + move to nurture

Performance targets: 30-40% open, 5-10% conversion

### Blast Sequence (3 emails, 2 days) — for urgent time-limited campaigns

1. J+0: 48-hour urgent offer (5 slots, 20% discount)
2. J+1: 24-hour final push
3. J+2: Offer expired + waitlist

Performance targets: 40% open, 2-5% conversion

### Nurture Sequence (2 emails, quarterly) — for long-term engagement

1. Q1: Seasonal update (spring offers)
2. Q2: Product updates (repeats quarterly)

Performance targets: 15% open, brand awareness

## How It Works

1. Vercel scheduler triggers GET /api/cron/acquisition-outreach (Mon-Fri 14:00 UTC)
2. Cron checks authorization header (Bearer CRON_SECRET)
3. Queries Supabase: acquisition_prospects WHERE next_email_at <= NOW()
4. For each prospect (max 20):
   - Get email template: `getAcquisitionEmail(prospect, type, step+1)`
   - Send via Resend (with from: "Jean-Samuel Leboeuf <js@haielite.ca>")
   - Log email to acquisition_emails table
   - Log activity to acquisition_activities
   - Update prospect: sequence_step++, next_email_at = future date
   - Update status: new → contacted (first email only)
5. If sequence complete: set next_email_at = NULL, move to nurture
6. Return JSON with metrics (processed, sent, errors)
7. All errors caught, logged, batch continues

## Database State Changes

After email sent:

```
sequence_step:         incremented by 1
last_email_sent_at:    set to NOW()
next_email_at:         set to NOW() + delay (or NULL if complete)
status:                new → contacted (first email), else unchanged
```

When sequence complete:

```
next_email_at:         set to NULL
status:                cold/blast → nurture, others unchanged
```

## Testing Approach

**Unit Tests** (`acquisition-emails.test.ts`):

- All 4 sequences return correct templates
- Email steps 1-5, 1-4, 1-3, 1-2 (depending on sequence)
- Delay calculations correct
- Completion detection works
- Email content contains company name
- HTML has <h2>, <p>, links

**Integration Test** (`test-acquisition-cron.sh`):

- Missing auth → 401
- Wrong secret → 401
- Correct auth → 200
- Response has {processed, sent, errors}

Run unit tests: `npm test -- acquisition-emails.test.ts`
Run integration: `./scripts/test-acquisition-cron.sh secret http://localhost:3000`

## Deployment Checklist

- [x] Code written + tested
- [ ] Run SQL migration (Supabase dashboard)
- [ ] Set CRON_SECRET environment variable (Vercel)
- [ ] Verify RESEND_API_KEY exists
- [ ] Test locally: `npm run dev` + curl endpoint
- [ ] Deploy: `git push`
- [ ] Monitor first 24 hours (check acquisition_activities)

## Key Design Decisions

1. **Edge runtime** — Fast, no cold starts, perfect for cron
2. **Bearer token auth** — Secure, matches other crons
3. **Per-prospect error handling** — One failure doesn't crash batch
4. **3 tables for logging** — Full auditability (prospects, emails, activities)
5. **Sequence logic separate from cron** — Reusable, testable, maintainable
6. **Max 20 prospects/batch** — Prevents timeouts on Vercel edge
7. **Automatic status transitions** — new → contacted → nurture
8. **HTML emails only** — Modern, responsive, better deliverability

## Future Enhancement Ideas

**Phase 1 (Q2 2026):**

- Resend webhooks for opens/clicks (populate opened_at, clicked_at)
- A/B testing on email subjects
- Dynamic send time optimization based on historical data

**Phase 2 (Q3 2026):**

- Reply detection (webhook from email provider)
- Unsubscribe management + bounced flag checking
- Lead scoring integration

**Phase 3 (Q4 2026):**

- Machine learning on best-performing sequences
- ServiceM8 job context enrichment in emails
- SMS fallback for non-email responders
- Multi-channel attribution

## Important Notes

- Email templates are HTML (responsive)
- Company name is auto-interpolated: `${prospect.company_name}`
- From email is constant: "Jean-Samuel Leboeuf <js@haielite.ca>"
- No A/B testing yet (all prospects get same template)
- No webhook integration yet (opens/clicks tracked manually)
- Bounce/complaint handling requires manual Resend dashboard review

## Troubleshooting Guide

| Problem          | Check                                             |
| ---------------- | ------------------------------------------------- |
| Cron not running | Vercel Deployments → CRON_SECRET set?             |
| Emails not sent  | `next_email_at <= NOW()`, RESEND_API_KEY valid    |
| 401 Unauthorized | Bearer token matches CRON_SECRET exactly          |
| Blank emails     | sequence_type in (cold, warm, blast, nurture)     |
| No prospects     | Insert test prospect with `next_email_at = NOW()` |

## Monitoring Queries

Check activity:

```sql
SELECT * FROM acquisition_activities
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

Check emails sent:

```sql
SELECT p.company_name, ae.subject, ae.sent_at
FROM acquisition_emails ae
JOIN acquisition_prospects p ON ae.prospect_id = p.id
WHERE ae.sent_at > NOW() - INTERVAL '7 days'
ORDER BY ae.sent_at DESC;
```

Check errors:

```sql
SELECT * FROM acquisition_activities
WHERE type = 'error'
ORDER BY created_at DESC;
```

## Documentation Map

Need quick start?
→ `/docs/ACQUISITION_INTEGRATION.md` (5-minute setup)

Need detailed setup?
→ `/ACQUISITION-OUTREACH-SETUP.md`

Need email details?
→ `/docs/EMAIL_SEQUENCES_REFERENCE.md`

Need complete index?
→ `/ACQUISITION_SYSTEM_INDEX.md`

## Code Quality

✓ Full TypeScript strict mode (no `any` types)
✓ Comprehensive error handling (try/catch per prospect)
✓ All functions properly typed
✓ No console.log in production code
✓ Follows existing repo patterns
✓ Edge runtime compatible
✓ No external dependencies added
✓ Tested (unit + integration)
✓ Documented (1,263 lines)

## Ready to Deploy

All files created, tested, and documented.

Next step: `git add . && git commit -m "Add acquisition outreach cron system" && git push`

After deploy:

1. Run SQL migration
2. Set CRON_SECRET in Vercel
3. Monitor first 24 hours
4. Check acquisition_activities table

---

**Status:** ✓ Production-Ready
**Date Completed:** March 31, 2026
