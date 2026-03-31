# Acquisition M&A API Integration Guide

Complete guide to integrating the Acquisition prospects API into your application.

## Table of Contents

1. [Setup](#setup)
2. [Basic Usage](#basic-usage)
3. [Advanced Patterns](#advanced-patterns)
4. [Building UI Components](#building-ui-components)
5. [Automation & Cron Jobs](#automation--cron-jobs)
6. [Common Workflows](#common-workflows)

---

## Setup

### 1. Environment Configuration

Add to `.env.local`:

```env
NEXT_PUBLIC_DASHBOARD_KEY=your_secret_dashboard_key
```

### 2. Run Database Migration

```bash
# Apply the migration to your Supabase database
supabase migration up

# Or via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Paste content from supabase/migrations/002_acquisition_prospects.sql
# 3. Run
```

### 3. Verify Tables Created

```bash
# Check tables exist
supabase db push

# Or verify in Supabase dashboard:
# - public.acquisition_prospects (50 fields, 6 indexes)
# - public.acquisition_activities (8 fields, 3 indexes)
```

---

## Basic Usage

### Import in Components

```typescript
import {
  createProspect,
  getProspect,
  updateProspect,
  listProspects,
  bulkImportProspects,
  getPipelineStats,
} from "@/lib/acquisitions";

import type {
  AcquisitionProspect,
  CreateProspectRequest,
  UpdateProspectRequest,
} from "@/types/acquisitions";
```

### Create a Prospect

```typescript
// Simple creation
const prospect = await createProspect({
  company_name: "Green Landscaping Inc",
  owner_name: "Pierre Dupont",
  owner_email: "pierre@greenlandscaping.qc.ca",
  priority: "high",
});

// With sequence automation
const prospect = await createProspect({
  company_name: "Montreal Tree Services",
  owner_name: "Jean-Claude Marchand",
  owner_email: "jc@mtltrees.qc.ca",
  sequence_type: "cold",
  priority: "medium",
  territory: "Montreal",
  source: "directory",
  notes: "Strong fit - established business, good margins",
});
```

### Get Prospect Details

```typescript
const { prospect, activities } = await getProspect(prospectId);

console.log(prospect.status); // "new" | "contacted" | etc.
console.log(prospect.emails_sent_count); // How many emails sent
console.log(activities); // Full activity history
```

### Update Prospect Status

```typescript
// Change status
await updateProspect(prospectId, {
  status: "qualified",
  priority: "critical",
  notes: "Owner confirmed interest in acquisition",
});

// Advance in email sequence
await updateProspect(prospectId, {
  sequence_step: 2,
  next_email_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days
});

// Record call notes
await updateProspect(prospectId, {
  call_notes:
    "Discussed valuation multiple: owner wants 4x EBITDA, we offered 3.2x",
  status: "negotiating",
});

// Note: Changing sequence_type auto-resets sequence_step=0 and next_email_at=now
```

### List and Search

```typescript
// Get all prospects
const all = await listProspects();

// Filter by status
const qualified = await listProspects({ status: "qualified" });

// Filter by priority
const urgent = await listProspects({ priority: "critical" });

// Search
const results = await searchProspects("Green");

// Paginated with filters
const page = await getPaginatedProspects(
  20, // limit
  0, // offset
  {
    status: "in_discussion",
    priority: "high",
    search: "landscaping",
  },
);
```

### Get Pipeline Statistics

```typescript
const stats = await getPipelineStats();

console.log(stats.summary.total_prospects);
console.log(stats.summary.response_rate); // % of prospects who replied
console.log(stats.status_breakdown); // Count per status
console.log(stats.activity.emails_sent_this_week);
```

---

## Advanced Patterns

### Batch Operations

```typescript
// Update multiple prospects at once
const ids = [...];
await updateMultipleProspects(ids, {
  status: "declined",
  notes: "No response after 3 months",
});

// Archive multiple
await archiveMultipleProspects(ids);
```

### Bulk Import from CSV

```typescript
import { bulkImportProspects } from "@/lib/acquisitions";

// Parse CSV and import
const csvData = [
  {
    company_name: "Company A",
    owner_name: "Owner A",
    owner_email: "a@example.com",
    territory: "Montreal",
    source: "directory",
  },
  // ... more rows
];

const result = await bulkImportProspects(csvData);

console.log(`Imported: ${result.imported}`);
console.log(`Duplicates: ${result.duplicates}`);
console.log(`Errors: ${result.errors}`);
console.log(result.details.error_messages);
```

### Prospect Filtering with Helper Functions

```typescript
import {
  daysSinceCreated,
  isEmailDue,
  needsFollowUp,
} from "@/lib/acquisitions";

const prospect = await getProspect(id);

if (daysSinceCreated(prospect) > 30) {
  // Prospect created more than 30 days ago
}

if (isEmailDue(prospect)) {
  // Time to send next email
}

if (needsFollowUp(prospect)) {
  // Follow-up is overdue
}
```

### Status Transitions

```typescript
// Define allowed transitions
const statusTransitions: Record<AcquisitionStatus, AcquisitionStatus[]> = {
  new: ["contacted", "declined", "archived"],
  contacted: ["qualified", "declined", "archived"],
  qualified: ["in_discussion", "declined", "archived"],
  in_discussion: ["offer_made", "declined", "archived"],
  offer_made: ["negotiating", "declined", "archived"],
  negotiating: ["due_diligence", "declined", "archived"],
  due_diligence: ["agreed", "declined", "archived"],
  agreed: ["closed", "declined", "archived"],
  closed: ["archived"],
  declined: ["contacted", "archived"], // Can re-reach after decline
  archived: [],
};

// Use in update logic
async function changeStatus(prospectId: string, newStatus: AcquisitionStatus) {
  const { prospect } = await getProspect(prospectId);
  const allowed = statusTransitions[prospect.status];

  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot change from ${prospect.status} to ${newStatus}`);
  }

  return updateProspect(prospectId, { status: newStatus });
}
```

---

## Building UI Components

### Prospect List Component

```typescript
"use client";

import { useState, useEffect } from "react";
import { listProspects } from "@/lib/acquisitions";
import type { AcquisitionProspect } from "@/types/acquisitions";

export function ProspectListComponent() {
  const [prospects, setProspects] = useState<AcquisitionProspect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await listProspects({ limit: 50 });
        setProspects(data);
      } catch (error) {
        console.error("Failed to load prospects:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <table className="w-full">
      <thead>
        <tr>
          <th>Company</th>
          <th>Owner</th>
          <th>Status</th>
          <th>Priority</th>
          <th>Emails Sent</th>
          <th>Next Email</th>
        </tr>
      </thead>
      <tbody>
        {prospects.map((p) => (
          <tr key={p.id}>
            <td>{p.company_name}</td>
            <td>{p.owner_name}</td>
            <td>{p.status}</td>
            <td>{p.priority}</td>
            <td>{p.emails_sent_count}</td>
            <td>
              {p.next_email_at
                ? new Date(p.next_email_at).toLocaleDateString()
                : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Create Prospect Form

```typescript
"use client";

import { useState } from "react";
import { createProspect } from "@/lib/acquisitions";
import type { CreateProspectRequest } from "@/types/acquisitions";

export function CreateProspectForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: CreateProspectRequest = {
      company_name: formData.get("company_name") as string,
      owner_name: formData.get("owner_name") as string,
      owner_email: (formData.get("owner_email") as string) || undefined,
      owner_phone: (formData.get("owner_phone") as string) || undefined,
      territory: (formData.get("territory") as string) || undefined,
      priority: (formData.get("priority") as any) || "medium",
    };

    try {
      const prospect = await createProspect(data);
      console.log("Created:", prospect);
      // Navigate or show success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="company_name" required placeholder="Company name" />
      <input name="owner_name" required placeholder="Owner name" />
      <input name="owner_email" type="email" placeholder="Email" />
      <input name="owner_phone" placeholder="Phone" />
      <input name="territory" placeholder="Territory" />
      <select name="priority">
        <option value="low">Low</option>
        <option value="medium" selected>
          Medium
        </option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Prospect"}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### Prospect Details Panel

```typescript
"use client";

import { useEffect, useState } from "react";
import { getProspect, updateProspect } from "@/lib/acquisitions";
import type {
  AcquisitionProspect,
  AcquisitionActivity,
} from "@/types/acquisitions";

export function ProspectDetailPanel({ prospectId }: { prospectId: string }) {
  const [prospect, setProspect] = useState<AcquisitionProspect | null>(null);
  const [activities, setActivities] = useState<AcquisitionActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { prospect: p, activities: a } = await getProspect(prospectId);
        setProspect(p);
        setActivities(a);
      } catch (error) {
        console.error("Failed to load prospect:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [prospectId]);

  if (loading || !prospect) return <div>Loading...</div>;

  return (
    <div className="prospect-detail">
      <h1>{prospect.company_name}</h1>
      <p>Owner: {prospect.owner_name}</p>
      <p>Status: {prospect.status}</p>
      <p>Priority: {prospect.priority}</p>
      <p>Emails sent: {prospect.emails_sent_count}</p>

      <h2>Activity History</h2>
      <ul>
        {activities.map((a) => (
          <li key={a.id}>
            <strong>{a.activity_type}</strong>: {a.subject}
            <time>{new Date(a.created_at).toLocaleString()}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Automation & Cron Jobs

### Email Sequence Cron Job

Create `app/api/cron/acquisition-email-sequence/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendAcquisitionEmail } from "@/lib/acquisition-emails";

export async function POST(request: NextRequest) {
  // Verify cron secret
  const cronSecret = request.headers.get("authorization");
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();

  // Get prospects due for email
  const { data: prospects } = await db
    .from("acquisition_prospects")
    .select("*")
    .not("next_email_at", "is", null)
    .lte("next_email_at", new Date().toISOString())
    .neq("status", "archived")
    .neq("status", "declined")
    .neq("status", "closed");

  let sent = 0;
  let failed = 0;

  for (const prospect of prospects || []) {
    try {
      // Get sequence template
      const emailTemplate = getSequenceEmail(
        prospect.sequence_type,
        prospect.sequence_step,
      );

      if (!emailTemplate) {
        // Sequence complete
        await db
          .from("acquisition_prospects")
          .update({ next_email_at: null })
          .eq("id", prospect.id);
        continue;
      }

      // Send email
      await sendAcquisitionEmail(
        prospect.owner_email,
        prospect.company_name,
        emailTemplate,
      );

      // Update prospect
      await db
        .from("acquisition_prospects")
        .update({
          sequence_step: prospect.sequence_step + 1,
          last_email_at: new Date().toISOString(),
          next_email_at: getNextEmailDate(prospect.sequence_type),
        })
        .eq("id", prospect.id);

      // Log activity
      await db.from("acquisition_activities").insert({
        prospect_id: prospect.id,
        activity_type: "email_sent",
        subject: emailTemplate.subject,
        email_sent_to: prospect.owner_email,
      });

      sent++;
    } catch (error) {
      console.error(`Failed to send email to ${prospect.owner_email}:`, error);
      failed++;
    }
  }

  return NextResponse.json({ sent, failed });
}

function getSequenceEmail(
  sequenceType: string,
  step: number,
): { subject: string; body: string } | null {
  const templates: Record<string, Record<number, any>> = {
    cold: {
      0: {
        subject: "Acquisition opportunity - Taillage de haies expansion",
        body: "...",
      },
      1: {
        subject: "Quick question about your haie trimming business",
        body: "...",
      },
      2: {
        subject: "Partnership & acquisition possibilities",
        body: "...",
      },
    },
  };

  return templates[sequenceType]?.[step] || null;
}

function getNextEmailDate(sequenceType: string): string {
  const delayDays: Record<string, number> = {
    cold: 3,
    warm: 2,
    referral: 2,
    partner: 1,
  };

  const daysDelay = delayDays[sequenceType] || 3;
  const nextDate = new Date(Date.now() + daysDelay * 24 * 60 * 60 * 1000);
  return nextDate.toISOString();
}
```

### Daily Pipeline Summary

Create `app/api/cron/acquisition-daily-summary/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendSMS } from "@/lib/twilio";

export async function POST(request: NextRequest) {
  const cronSecret = request.headers.get("authorization");
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getSupabaseAdmin();

  // Get stats
  const { data: statusCounts } = await db
    .from("acquisition_prospects")
    .select("status");

  const statuses = statusCounts?.reduce(
    (acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Send SMS to Henri
  const message = `
Acquisition Pipeline Update:
New: ${statuses?.new || 0}
Contacted: ${statuses?.contacted || 0}
Qualified: ${statuses?.qualified || 0}
In Discussion: ${statuses?.in_discussion || 0}
  `;

  await sendSMS(process.env.HENRI_PHONE!, message);

  return NextResponse.json({ success: true });
}
```

---

## Common Workflows

### Cold Outreach Campaign

```typescript
// 1. Import prospects from directory
const importResult = await bulkImportProspects([
  // ... 50 landscaping companies
]);

console.log(`Imported ${importResult.imported} prospects`);

// 2. Cron job runs daily:
// - Gets prospects with next_email_at <= now
// - Sends cold email (step 0)
// - Updates sequence_step to 1
// - Sets next_email_at to 3 days from now

// 3. After 3 attempts over 7 days:
// - Sequence complete (no more emails)
// - Manager manually follows up or archives

// 4. Track results
const stats = await getPipelineStats();
console.log(`Response rate: ${stats.summary.response_rate}%`);
```

### Deal Negotiation Tracking

```typescript
// Initial contact
let prospect = await createProspect({
  company_name: "Green Landscaping",
  owner_name: "Pierre",
  owner_email: "pierre@green.qc.ca",
  priority: "high",
  sequence_type: "cold",
});

// After email engagement -> qualified
prospect = await updateProspect(prospect.id, {
  status: "qualified",
  call_notes: "Owner responded, scheduled call",
});

// After call -> in discussion
prospect = await updateProspect(prospect.id, {
  status: "in_discussion",
  call_notes:
    "Discussed 3.5x EBITDA multiple, owner interested at 3.2x plus 2-yr earn-out",
  offer_plan_a: "3.2x EBITDA with 2-year earn-out based on customer retention",
  offer_plan_b: "3.0x EBITDA + $200k signing bonus for owner to stay 18 months",
});

// Send offer
prospect = await updateProspect(prospect.id, {
  status: "offer_made",
  deal_structure: "3.2x EBITDA = $1.2M, plus $200k earn-out over 2 years",
});

// Manager negotiates
prospect = await updateProspect(prospect.id, {
  status: "negotiating",
  call_notes: "Owner countered at 3.5x, discussed earnout terms",
  notes: "Meeting scheduled Friday 2pm to finalize",
});

// Agreement reached
prospect = await updateProspect(prospect.id, {
  status: "agreed",
  deal_structure:
    "AGREED: 3.3x EBITDA ($1.245M) + 20% earnout over 2 years, Owner stays 18 months",
});

// Due diligence
prospect = await updateProspect(prospect.id, {
  status: "due_diligence",
  notes: "Accountant reviewing financials, legal reviewing contracts",
});

// Close
prospect = await updateProspect(prospect.id, {
  status: "closed",
  notes: "Deal closed! Owner onboarded, team integration starting",
});
```

---

## Tips & Best Practices

### Email Sequence Strategy

- **Cold (0-2)**: Introduction, Value prop, Social proof (3 days apart)
- **Warm (0-1)**: Short intro, Easy ask (2 days apart)
- **Referral (0)**: Single warm email with mutual contact intro
- **Partner (0)**: Partner makes intro, direct conversation

### Priority Escalation

- Start all at "medium"
- If owner responds -> escalate to "high"
- If offer made -> escalate to "critical"
- If declined after offer -> reduce to "low"

### Territory Planning

Group by territory to:

- Coordinate visits
- Share local market insights
- Identify cluster opportunities

### Notes Field

Use structured notes:

```
FINANCIALS: $2.5M revenue, $400k EBITDA, growing 15% YoY
OWNER: 45y, wants succession, interested in staying 18 months
TEAM: 8 employees, very stable
MAIN CONCERN: Will we keep his team?
NEXT STEP: Send offer Monday
```

---

## Troubleshooting

### "Unauthorized" Error

```
Check: NEXT_PUBLIC_DASHBOARD_KEY matches process.env.DASHBOARD_KEY
```

### Prospect Not Saving

```typescript
// Validate required fields
const required = ["company_name", "owner_name"];
if (!required.every((k) => data[k])) {
  throw new Error("Missing required fields");
}

// Check status is valid
const validStatuses = [
  "new",
  "contacted",
  // ...
];
```

### Email Sequence Not Running

```
1. Check: Cron job route is accessible
2. Check: Authorization header matches CRON_SECRET
3. Check: next_email_at is in the past
4. Check: status != 'archived' | 'declined' | 'closed'
5. Check: Logs in Vercel/Fly.io dashboard
```

---

## API Response Examples

### Create Prospect

```json
{
  "success": true,
  "prospect": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "company_name": "Green Landscaping Co",
    "owner_name": "Pierre Dupont",
    "owner_email": "pierre@green.qc.ca",
    "status": "new",
    "sequence_type": "cold",
    "sequence_step": 0,
    "priority": "high",
    "next_email_at": "2026-04-01T20:30:00.000Z",
    "emails_sent_count": 0,
    "created_at": "2026-03-31T20:30:00.000Z",
    "updated_at": "2026-03-31T20:30:00.000Z"
  }
}
```

### Get Stats

```json
{
  "summary": {
    "total_prospects": 47,
    "active_prospects": 42,
    "total_replies": 8,
    "response_rate": 19.05
  },
  "status_breakdown": {
    "new": 15,
    "contacted": 12,
    "qualified": 8,
    "in_discussion": 5,
    "offer_made": 1,
    "negotiating": 0,
    "due_diligence": 0,
    "agreed": 0,
    "closed": 0,
    "declined": 3,
    "archived": 0
  },
  "sequence_breakdown": {
    "cold": 32,
    "warm": 10,
    "referral": 3,
    "partner": 2
  },
  "activity": {
    "emails_sent_this_week": 12,
    "emails_sent_this_month": 28,
    "upcoming_emails_7_days": 8
  }
}
```

---

For complete API documentation, see [README.md](./README.md)
