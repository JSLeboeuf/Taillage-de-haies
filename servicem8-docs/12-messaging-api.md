# ServiceM8 Messaging API - Overview

## Key Content Summary

### Public Applications Only
"The ServiceM8 Messaging API is only available to Public Applications." Users must implement OAuth 2.0 Authentication and obtain access tokens before using this API.

### Core Messaging Services
The platform offers messaging capabilities with built-in advantages. Users' emails automatically include pre-configured email signatures from their accounts, and enabled Premium SMS services become immediately accessible to applications.

### Message Sending Quota System

ServiceM8 implements sending limits to regulate message volume and transmission rates, benefiting all customers by maintaining trusted relationships between the platform, users, and add-ons.

**Two Sending Limits:**

1. **Sending Quota** – Maximum messages per 24-hour rolling period. The system checks previous 24-hour activity before accepting requests. Example: with a 500-message quota and 100 sent previously, 400 more can be sent immediately. Once quota is reached, requests are rejected with throttling exceptions.

2. **Maximum Send Rate** – Maximum messages per minute. Short bursts are acceptable, but sustained overages are not permitted.

### Error Responses

When limits are exceeded, users receive:
- "429 Too Many Requests: Maximum sending rate exceeded"
- "429 Too Many Requests: Daily message quota exceeded"

### Increasing Quota

The system automatically increases limits when high-quality messages are detected and utilization approaches current thresholds. If automatic increases don't occur and needs aren't met, users can submit a Sending Quota Increase ticket through the Support Center.

### Implementation Reference

Developers should consult the [Messaging API Reference](/reference#email) for endpoint details.
