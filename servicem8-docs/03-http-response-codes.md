# HTTP Response Codes

## Overview

When making requests to ServiceM8 API endpoints, you'll receive standardized HTTP response codes indicating the result of your request.

## Response Code Reference

| Code | Title | Description |
|------|-------|-------------|
| 200 | OK | Successful request |
| 400 | Bad Request | A validation exception has occurred |
| 401 | Unauthorised | Invalid credentials or invalid OAuth token |
| 402 | Payment Required | ServiceM8 account not in good standing; outstanding invoices require payment |
| 403 | Forbidden | Invalid scope credentials for the current request, or invalid staff member UUID specified for impersonation |
| 404 | Not Found | The requested resource cannot be found |
| 426 | Upgrade Required | Public applications must use HTTPS for all requests |
| 429 | Too Many Requests | Request was throttled for your application/account pairing |
| 500 | Internal Server Error | An unhandled exception has occurred; contact support if this persists |
| 503 | Service Unavailable | Platform is currently unavailable; try again soon |

## Throttling

ServiceM8 API implements rate limiting to maintain service quality. The system applies throttles when consumers exceed request thresholds.

### Rate Limits

- **180 requests per minute**
- **20,000 requests per day**

When either limit is reached, the API returns HTTP 429 with the message: "Number of allowed API requests per minute exceeded"

### Best Practices

Developers should anticipate throttling errors and implement appropriate handling strategies such as:
- Using cached values from previous calls
- Notifying end users of rate limit status
- Retrying requests after a delay

### Per-Account Application

Throttling limits apply independently for each application-account pairing. A single application connected to multiple ServiceM8 accounts will have separate rate limits for each account.

---

**Last Updated:** 9 months ago
