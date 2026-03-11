# Haie Lite — Automation Backend

Business automation backend for hedge trimming operations. Integrates ServiceM8, Twilio, Supabase, Resend, OpenAI, Vapi, and Stripe.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **CRM**: ServiceM8
- **Database**: Supabase (PostgreSQL)
- **SMS**: Twilio
- **Email**: Resend
- **AI**: OpenAI (text), Vapi (voice)
- **Payments**: Stripe
- **Hosting**: Vercel

## Project Structure

```
haie-lite-app/
├── app/
│   ├── api/
│   │   ├── webhooks/          # External service webhooks
│   │   │   ├── meta-leads/    # Facebook lead ads
│   │   │   ├── servicem8/     # CRM events
│   │   │   ├── twilio-sms/    # SMS messages
│   │   │   ├── vapi/          # Voice AI calls
│   │   │   └── stripe/        # Payment events
│   │   ├── cron/              # Scheduled jobs (12 total)
│   │   │   ├── sync-timesheets/
│   │   │   ├── daily-payroll/
│   │   │   ├── daily-kpi/
│   │   │   ├── lead-followup/
│   │   │   ├── job-confirmation/
│   │   │   ├── review-request/
│   │   │   ├── check-google-reviews/
│   │   │   ├── weekly-employee-report/
│   │   │   ├── monthly-performance/
│   │   │   ├── upsell-followup/
│   │   │   ├── dormant-reactivation/
│   │   │   └── weather-alert/
│   │   ├── quotes/            # Quote calculation
│   │   ├── leads/             # Lead management
│   │   ├── upsell/            # Upsell engine
│   │   ├── subscriptions/     # Maintenance plans
│   │   ├── payroll/           # Employee payroll
│   │   └── commercial/        # Sales pipeline
│   ├── layout.tsx
│   └── page.tsx               # Health check
├── types/
│   ├── index.ts               # TypeScript types
│   └── schemas.ts             # Zod validation schemas
├── package.json
├── tsconfig.json
├── next.config.mjs
├── vercel.json                # Cron schedules
├── .env.example
└── .gitignore
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in all required values:

```bash
cp .env.example .env.local
```

Required variables:
- ServiceM8 API key
- Supabase URL and keys
- Twilio credentials
- Resend API key
- OpenAI API key
- Stripe keys
- Vapi API key
- Google Business Profile API key
- Cron secret (generate with `openssl rand -base64 32`)
- Henri and Jean-Samuel phone numbers

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to verify the app is running.

### 4. Type Check

```bash
npm run type-check
```

## Deployment

### Vercel Deployment

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

Cron jobs are automatically configured via `vercel.json`.

### Webhook URLs

After deployment, configure these webhook URLs in external services:

- **Meta (Facebook)**: `https://your-domain.vercel.app/api/webhooks/meta-leads`
- **ServiceM8**: `https://your-domain.vercel.app/api/webhooks/servicem8`
- **Twilio**: `https://your-domain.vercel.app/api/webhooks/twilio-sms`
- **Vapi**: `https://your-domain.vercel.app/api/webhooks/vapi`
- **Stripe**: `https://your-domain.vercel.app/api/webhooks/stripe`

## Cron Schedule (Montreal Time)

All cron jobs run in UTC. Montreal is UTC-5 (EST) / UTC-4 (EDT).

| Job | Schedule | Montreal Time (EDT) | Purpose |
|-----|----------|---------------------|---------|
| sync-timesheets | Hourly | Every hour | Sync ServiceM8 timesheets |
| daily-payroll | Mon-Fri 21:30 UTC | 5:30pm | Daily payroll report to Henri |
| daily-kpi | Daily 11:00 UTC | 7:00am | Daily KPI dashboard |
| lead-followup | Mon-Fri 14:00 UTC | 10:00am | Automated lead follow-ups |
| job-confirmation | Daily 18:00 UTC | 2:00pm | Next-day job confirmations |
| review-request | Hourly | Every hour | Post-job review requests |
| check-google-reviews | Daily 12:00 UTC | 8:00am | Monitor Google reviews |
| weekly-employee-report | Fri 21:00 UTC | 5:00pm | Weekly performance report |
| monthly-performance | 1st 12:00 UTC | 8:00am | Monthly business report |
| upsell-followup | Mon-Fri 15:00 UTC | 11:00am | Upsell opportunity follow-up |
| dormant-reactivation | 1st, 15th 14:00 UTC | 10:00am | Reactivate dormant customers |
| weather-alert | Daily 10:00 UTC | 6:00am | Weather forecast alerts |

## Implementation Status

All routes are created with TODO placeholders. Implementation priorities:

### Phase 1: Foundation (Week 1-2)
- [ ] ServiceM8 webhook handler
- [ ] Lead creation endpoint
- [ ] Quote calculator
- [ ] SMS integration (Twilio)
- [ ] Timesheet sync cron

### Phase 2: Automation (Week 3-4)
- [ ] Meta lead webhook
- [ ] Vapi voice AI integration
- [ ] Daily KPI cron
- [ ] Lead follow-up automation
- [ ] Review request automation

### Phase 3: Advanced (Week 5-6)
- [ ] Upsell engine
- [ ] Subscription management
- [ ] Employee incentive tracking
- [ ] Payroll export
- [ ] Commercial pipeline analytics

## Key Features

### Lead Pipeline
- Automatic lead capture from Facebook ads
- AI voice qualification via Vapi
- SMS follow-up sequences
- Quote generation and tracking

### Operations
- Real-time timesheet sync from ServiceM8
- Automated job confirmations
- Weather alerts for scheduled jobs
- Review request automation

### Employee Management
- Time tracking and approval
- Incentive calculations
- Weekly performance reports
- Payroll export (CSV)

### Revenue Growth
- Upsell opportunity detection
- Automated upsell follow-ups
- Dormant customer reactivation
- Maintenance subscription management

### Analytics
- Daily KPI reports
- Weekly employee performance
- Monthly business metrics
- Sales pipeline visualization

## Development Notes

- All code comments in English
- Strict TypeScript mode enabled
- Zod schemas for all external inputs
- All cron jobs require Bearer token authentication
- Webhook signature verification required for production
- Error handling at system boundaries only

## Support

For questions or issues, contact Henri or Jean-Samuel.
