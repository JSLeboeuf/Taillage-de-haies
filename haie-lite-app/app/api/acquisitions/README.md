# Acquisition M&A Prospects API

Complete REST API for managing B2B acquisition prospects with email sequence automation.

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer {DASHBOARD_KEY}
```

Set `DASHBOARD_KEY` environment variable in `.env.local`.

## Endpoints

### 1. List Prospects

**GET** `/api/acquisitions/prospects`

List all acquisition prospects with optional filtering and search.

**Query Parameters:**

- `status` (string): Filter by status (new, contacted, qualified, in_discussion, offer_made, negotiating, due_diligence, agreed, closed, declined)
- `sequence_type` (string): Filter by sequence type (cold, warm, referral, partner)
- `priority` (string): Filter by priority (low, medium, high, critical)
- `territory` (string): Filter by territory
- `search` (string): Fuzzy search on company_name or owner_name
- `limit` (number, default 100, max 1000): Number of results per page
- `offset` (number, default 0): Pagination offset

**Response:**

```json
{
  "prospects": [
    {
      "id": "uuid",
      "company_name": "string",
      "owner_name": "string",
      "owner_email": "string|null",
      "owner_phone": "string|null",
      "territory": "string|null",
      "source": "string|null",
      "status": "string",
      "sequence_type": "string",
      "sequence_step": number,
      "priority": "string",
      "emails_sent_count": number,
      "replied_at": "ISO8601|null",
      "next_email_at": "ISO8601|null",
      "next_followup_at": "ISO8601|null",
      "tags": ["string"],
      "notes": "string|null",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ],
  "pagination": {
    "offset": number,
    "limit": number,
    "total": number
  }
}
```

---

### 2. Create Prospect

**POST** `/api/acquisitions/prospects`

Create a new acquisition prospect.

**Request Body:**

```json
{
  "company_name": "string (required)",
  "owner_name": "string (required)",
  "owner_email": "string (optional, email format)",
  "owner_phone": "string (optional)",
  "territory": "string (optional)",
  "source": "string (optional)",
  "estimated_age_years": number (optional, positive integer),
  "sequence_type": "cold|warm|referral|partner (default: cold)",
  "priority": "low|medium|high|critical (default: medium)",
  "tags": ["string"] (optional),
  "notes": "string (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "prospect": {
    "id": "uuid",
    "company_name": "string",
    "owner_name": "string",
    "status": "new",
    "sequence_type": "string",
    "sequence_step": 0,
    "next_email_at": "ISO8601|null",
    ...
  }
}
```

**Status Codes:**

- `201`: Prospect created
- `400`: Validation error
- `401`: Unauthorized
- `409`: Prospect with this company name already exists
- `500`: Server error

---

### 3. Get Prospect Details

**GET** `/api/acquisitions/prospects/:id`

Get full prospect details including activity history.

**Response:**

```json
{
  "prospect": {
    "id": "uuid",
    "company_name": "string",
    "owner_name": "string",
    "status": "string",
    "sequence_type": "string",
    "emails_sent_count": number,
    "call_notes": "string|null",
    "offer_plan_a": "string|null",
    "offer_plan_b": "string|null",
    "deal_structure": "string|null",
    ...
  },
  "activities": [
    {
      "id": "uuid",
      "activity_type": "email_sent|email_replied|call_made|meeting|note_added|status_changed|offer_sent|document_sent",
      "subject": "string",
      "notes": "string|null",
      "created_at": "ISO8601"
    }
  ]
}
```

---

### 4. Update Prospect

**PATCH** `/api/acquisitions/prospects/:id`

Update prospect information and status.

**Request Body:**

```json
{
  "status": "string (optional)",
  "sequence_type": "string (optional)",
  "sequence_step": number (optional, 0-5),
  "priority": "string (optional)",
  "notes": "string (optional)",
  "call_notes": "string (optional)",
  "offer_plan_a": "string (optional)",
  "offer_plan_b": "string (optional)",
  "deal_structure": "string (optional)",
  "next_email_at": "ISO8601 (optional)",
  "next_followup_at": "ISO8601 (optional)",
  "tags": ["string"] (optional),
  "assigned_to": "string (optional)"
}
```

**Special Behavior:**

- If `sequence_type` is changed, `sequence_step` is reset to 0 and `next_email_at` is set to now
- Status changes and note additions are automatically logged as activities

**Response:**

```json
{
  "success": true,
  "prospect": { ... }
}
```

---

### 5. Archive Prospect

**DELETE** `/api/acquisitions/prospects/:id`

Archive prospect (soft delete). Sets status to 'archived'.

**Response:**

```json
{
  "success": true,
  "message": "Prospect archived"
}
```

---

### 6. Bulk Import Prospects

**POST** `/api/acquisitions/import`

Import multiple prospects from CSV/JSON in batch.

**Request Body:**

```json
{
  "prospects": [
    {
      "company_name": "string (required)",
      "owner_name": "string (required)",
      "owner_email": "string (optional)",
      "owner_phone": "string (optional)",
      "territory": "string (optional)",
      "source": "string (optional)",
      "estimated_age_years": number (optional),
      "notes": "string (optional)"
    }
  ]
}
```

**Response:**

```json
{
  "imported": number,
  "duplicates": number,
  "errors": number,
  "details": {
    "imported_companies": ["string"],
    "duplicate_companies": ["string"],
    "error_messages": ["string"]
  }
}
```

**Limits:**

- Max 1000 prospects per import
- Duplicates (same company_name) are skipped
- All imported prospects start with status='new', sequence_type='cold', priority='medium'
- If owner_email provided, next_email_at is set to now

---

### 7. Pipeline Statistics

**GET** `/api/acquisitions/stats`

Get acquisition pipeline statistics and KPIs.

**Response:**

```json
{
  "summary": {
    "total_prospects": number,
    "active_prospects": number,
    "total_replies": number,
    "response_rate": number (percentage)
  },
  "status_breakdown": {
    "new": number,
    "contacted": number,
    "qualified": number,
    "in_discussion": number,
    "offer_made": number,
    "negotiating": number,
    "due_diligence": number,
    "agreed": number,
    "closed": number,
    "declined": number
  },
  "sequence_breakdown": {
    "cold": number,
    "warm": number,
    "referral": number,
    "partner": number
  },
  "activity": {
    "emails_sent_this_week": number,
    "emails_sent_this_month": number,
    "upcoming_emails_7_days": number
  }
}
```

---

## Status Values

| Status        | Meaning                          |
| ------------- | -------------------------------- |
| new           | First contact pending            |
| contacted     | Initial outreach sent            |
| qualified     | Met qualification criteria       |
| in_discussion | Active negotiations              |
| offer_made    | Formal offer submitted           |
| negotiating   | Deal terms being discussed       |
| due_diligence | Financial/legal review           |
| agreed        | Terms agreed, awaiting signature |
| closed        | Deal closed                      |
| declined      | Prospect declined                |
| archived      | Archived (not pursuing)          |

---

## Sequence Types

| Type     | Purpose                            |
| -------- | ---------------------------------- |
| cold     | Cold outreach to unknown prospects |
| warm     | Warm introduction via intermediary |
| referral | Referred by customer/partner       |
| partner  | Partner referral sequence          |

---

## Database Schema

### acquisition_prospects table

- `id` (UUID): Primary key
- `company_name` (TEXT): Required, unique per active prospect
- `owner_name` (TEXT): Required
- `owner_email` (TEXT): Optional
- `owner_phone` (TEXT): Optional
- `territory` (TEXT): Optional geographic classification
- `source` (TEXT): Where prospect came from
- `status` (TEXT): Current status in pipeline
- `sequence_type` (TEXT): Email sequence type
- `sequence_step` (INTEGER): Current step (0-5)
- `priority` (TEXT): low/medium/high/critical
- `next_email_at` (TIMESTAMPTZ): When to send next email
- `last_email_at` (TIMESTAMPTZ): When last email was sent
- `emails_sent_count` (INTEGER): Total emails sent
- `replied_at` (TIMESTAMPTZ): When prospect first replied
- `notes` (TEXT): General notes
- `call_notes` (TEXT): Call transcription/summary
- `offer_plan_a` (TEXT): Primary acquisition structure
- `offer_plan_b` (TEXT): Alternative structure
- `deal_structure` (TEXT): Negotiated structure
- `tags` (TEXT[]): Tags for filtering
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### acquisition_activities table

- `id` (UUID): Primary key
- `prospect_id` (UUID): Foreign key to acquisition_prospects
- `activity_type` (TEXT): Type of activity
- `subject` (TEXT): Activity subject/description
- `notes` (TEXT): Detailed notes
- `old_value` (TEXT): For status_changed activities
- `new_value` (TEXT): For status_changed activities
- `created_at` (TIMESTAMPTZ)

---

## Examples

### Create a prospect

```bash
curl -X POST http://localhost:3000/api/acquisitions/prospects \
  -H "Authorization: Bearer YOUR_DASHBOARD_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Green Landscaping Co",
    "owner_name": "Pierre Dupont",
    "owner_email": "pierre@greenlandscaping.qc.ca",
    "owner_phone": "+1-514-555-1234",
    "territory": "Montreal",
    "source": "directory",
    "estimated_age_years": 5,
    "priority": "high",
    "notes": "Strong fit for acquisition"
  }'
```

### List prospects by status

```bash
curl "http://localhost:3000/api/acquisitions/prospects?status=qualified&priority=high&limit=50" \
  -H "Authorization: Bearer YOUR_DASHBOARD_KEY"
```

### Update prospect status

```bash
curl -X PATCH http://localhost:3000/api/acquisitions/prospects/{id} \
  -H "Authorization: Bearer YOUR_DASHBOARD_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_discussion",
    "priority": "critical",
    "call_notes": "Owner interested in 3x revenue multiple, wants to stay involved for 2 years"
  }'
```

### Bulk import

```bash
curl -X POST http://localhost:3000/api/acquisitions/import \
  -H "Authorization: Bearer YOUR_DASHBOARD_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prospects": [
      {
        "company_name": "Company 1",
        "owner_name": "Owner 1",
        "owner_email": "owner1@example.com",
        "source": "directory"
      },
      {
        "company_name": "Company 2",
        "owner_name": "Owner 2",
        "owner_email": "owner2@example.com",
        "source": "directory"
      }
    ]
  }'
```

### Get pipeline stats

```bash
curl "http://localhost:3000/api/acquisitions/stats" \
  -H "Authorization: Bearer YOUR_DASHBOARD_KEY"
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Optional validation details"
}
```

**Common Error Codes:**

- `400`: Validation error (invalid input)
- `401`: Unauthorized (missing or invalid DASHBOARD_KEY)
- `404`: Resource not found
- `409`: Conflict (duplicate company name)
- `500`: Server error

---

## Migration

Run the database migration to create the required tables:

```bash
# Using Supabase CLI
supabase migration up

# Or manually in Supabase dashboard:
# Copy the SQL from supabase/migrations/002_acquisition_prospects.sql
```

---

## Security

- All endpoints require DASHBOARD_KEY authentication
- Uses Supabase admin client (service role) for database access
- RLS enabled on both tables with service_role bypass
- No sensitive data logged to console in production
- UUIDs validated before database queries
