# Webhooks API Overview

## What is a Webhook?

A webhook is a mechanism for retrieving and storing event data by registering an HTTP/HTTPS URL to receive JSON-formatted event information. ServiceM8 webhooks enable:

- Real-time scheduling change notifications
- Price update tracking for inventory items
- Staff notifications for job modifications
- Data collection for warehousing purposes
- Accounting software integration

**Key limitation:** Webhook updates only indicate field changes—not their values. You must use the REST API to retrieve actual record data after receiving notifications.

## Setting Up Webhooks

### Creating Subscriptions

Use the endpoint: `https://api.servicem8.com/webhook_subscriptions`

Basic operations include:
- Adding or modifying subscriptions
- Listing existing subscriptions
- Deleting subscriptions

### Callback URL Requirements

Your callback URL must:
- Be publicly accessible to ServiceM8 servers
- Accept form-encoded POST data
- Return HTTP 200 responses consistently

## Verification Process

**Public applications (OAuth 2)** must complete a challenge verification. When adding/modifying subscriptions, ServiceM8 sends a POST request with:

| Parameter | Value |
|-----------|-------|
| mode | subscribe |
| challenge | random string |

Return only the challenge value to confirm your server's readiness.

### PHP Example
```php
<?php
if ($_REQUEST['mode'] == 'subscribe' && $_REQUEST['challenge']) {
    echo $_REQUEST['challenge'];
}
```

## Webhook Data Format

ServiceM8 sends JSON POST data:

```json
{
  "object": "job",
  "entry": [{
    "changed_fields": ["badges","generated_job_id"],
    "time": "2015-01-01 00:00:00",
    "uuid": "de305d54-75b4-431b-adb2-eb6b9e546013"
  }],
  "resource_url": "https://api.servicem8.com/api_1.0/job/..."
}
```

Access values using: `entry[0].time`

**Note:** Timestamps are in UTC, unlike other ServiceM8 timestamps.

## Response Codes

| Code | Title | Action |
|------|-------|--------|
| 200 | Success | Webhook completes successfully |
| 410 | Gone | Webhook unsubscribed automatically |
| 429 | Throttled | Request volume throttled for 15 minutes |
| 4xx/5xx | Error | Retried up to 72 hours, then cancelled |

## Supported Objects

- Job Activity
- Job
- Job Payment
- Note
- Task
- Material
- Company
- Attachment
- Form Response

---

**Reference:** See the [Webhooks API Reference](/reference#webhook-subscription) for endpoint details.
