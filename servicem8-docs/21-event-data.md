# Event Data Documentation

## Overview

ServiceM8 Add-on functions receive input from events and return HTML/JavaScript for UI rendering. Events originate from user action button clicks or field value changes in records like Jobs and Clients.

## Input Provided

When events occur, ServiceM8 invokes Lambda functions or callback URLs with event details. For web service callbacks, the event is provided as a JSON Web Token (JWT) in the HTTP request body.

### Event Object Properties

| Property | Description |
|----------|-------------|
| `eventVersion` | SDK version, currently `1.0` |
| `eventName` | Matches action event parameter or `webhook_subscription` for webhooks |
| `auth.accountUUID` | UUID of the ServiceM8 account generating the event |
| `auth.staffUUID` | UUID of the Staff member who generated the event |
| `auth.accessToken` | OAuth access token (Lambda functions only) |
| `auth.accessTokenExpiry` | OAuth token expiry in seconds |
| `eventArgs` | Event-specific data (see below) |

### Action Events

Action events occur when users click add-on buttons in Job Card or Client Card.

| Property | Description |
|----------|-------------|
| `eventArgs.jobUUID` | UUID of the Job being viewed |
| `eventArgs.companyUUID` | UUID of the Client being viewed |

### Webhook Events

Webhook events trigger when field values change for registered records.

| Property | Description |
|----------|-------------|
| `eventArgs.object` | Object type that changed (e.g., "job") |
| `eventArgs.entry` | Array containing one changed record |
| `eventArgs.entry[0].uuid` | UUID of the changed record |
| `eventArgs.entry[0].changed_fields` | List of changed fields |
| `eventArgs.entry[0].time` | UTC timestamp of change |
| `eventArgs.resource_url` | Full record retrieval URL |

## Example: Action Event

```json
{
  "eventVersion": "1.0",
  "eventName": "hello_addon_event",
  "auth": {
    "accountUUID": "5e32b1f1-bb9f-457a-a67c-44dd7ff8ac1b",
    "staffUUID": "9d914a06-221e-4013-8b4d-2735272710eb",
    "accessToken": "9cd88543362a447291cfc362e3ce86f73d94eb2d",
    "accessTokenExpiry": 900
  },
  "eventArgs": {
    "jobUUID": "0686ce69-4a5d-4f73-ad56-827ffaaced2b"
  }
}
```

## Example: Webhook Event

```json
{
  "eventVersion": "1.0",
  "eventName": "webhook_subscription",
  "auth": {
    "accountUUID": "5e32b1f1-bb9f-457a-a67c-44dd7ff8ac1b",
    "staffUUID": "9d914a06-221e-4013-8b4d-2735272710eb",
    "accessToken": "9cd88543362a447291cfc362e3ce86f73d94eb2d",
    "accessTokenExpiry": 900
  },
  "eventArgs": {
    "object": "job",
    "entry": [{
      "uuid": "0686ce69-4a5d-4f73-ad56-827ffaaced2b",
      "changed_fields": ["status"],
      "time": "2017-01-01 12:21:12"
    }],
    "resource_url": "https://api.servicem8.com/api_1.0/Job/0686ce69-4a5d-4f73-ad56-827ffaaced2b.json"
  }
}
```

## Output Required

**Webhook Events:** No output required. Function must complete before timeout expires.

**Action Events:** Must return complete HTML document (with `<html>`, `<head>`, `<body>` tags) for iframe rendering. JavaScript can implement client-side functionality like window resizing or closing via the Client API.
