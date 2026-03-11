# Manifest Reference Documentation

## Overview

The manifest file is a JSON configuration that defines an ServiceM8 add-on's capabilities, appearance, and integrations.

## Sample Add-on Manifest

```json
{
  "name": "Hello World Addon",
  "version": "1.0",
  "iconURL": "https://www.servicem8.com/images/addon-sdk-sample-icon.png",
  "supportURL": "https://support.exampleaddon.com",
  "supportEmail": "support@exampleaddon.com",
  "oauth": {
    "scope": "create_jobs create_clients"
  },
  "actions": [{
    "name": "Hello Action",
    "type": "online",
    "entity": "job",
    "iconURL": "https://www.servicem8.com/images/addon-sdk-sample-icon.png",
    "event": "hello_world_event",
    "location": "modal"
  }],
  "menuItems": [{
    "name": "Hello Menu",
    "type": "addon",
    "iconURL": "https://www.servicem8.com/images/addon-sdk-sample-icon.png",
    "event": "hello_world_event"
  }],
  "webhooks": [{
    "object": "job",
    "fields": ["job_address", "billing_address"]
  }]
}
```

## Core Parameters

### name
The display name for your add-on.

### version
Version identifier incremented with each release to the add-on store.

### iconURL
Publicly accessible image URL for the add-on icon (minimum 512x512px recommended) displayed in the ServiceM8 Add-on Store.

### supportURL
Customer support landing page URL for add-on users.

### supportEmail
Contact email for add-on support inquiries.

### oauth[scope]
Space-separated list of OAuth scopes required for serverless OAuth activation. Determines API access levels for STS tokens.

## Actions

Capabilities to add buttons on Job or Client cards. Optional and multiple actions supported.

### actions[name] — Mandatory
Display name visible to users in web or mobile platforms.

### actions[type] — Mandatory
Platform target. Valid values:
- **online**: Web platform job/client cards
- **app**: Mobile app job/client cards

### actions[entity] — Mandatory
Card type. Valid values:
- **job**: Job card
- **company**: Client card

### actions[iconURL] — Mandatory
Icon URL (256x256px recommended) displayed within the card.

### actions[event] — Mandatory
Backend event name triggered when users activate the action. Events receive job, company, and account context automatically.

**Best practice**: Use lowercase event names consistently throughout the manifest to prevent confusion.

### actions[location]
Where to present the action interface. Web platform only; mobile uses window mode.
- **modal**: Popup within ServiceM8 UI (default for online)
- **window**: New tab/window outside ServiceM8 UI (default for app)

## Menu Items

Capabilities to add menu entries in web (Addons menu) or mobile (More menu). Optional and multiple items supported.

### menuItems[name] — Mandatory
Menu item display name.

### menuItems[type] — Mandatory
Menu location. Valid values:
- **addon**: Online Addons menu
- **app**: Mobile More tab menu

### menuItems[iconURL] — Mandatory
Icon URL (256x256px recommended) for the menu item.

### menuItems[event] — Mandatory
Backend event name invoked when users click the menu item.

**Best practice**: Maintain lowercase event naming for consistency across invocations.

## Webhooks

Event-based subscriptions to account data changes. Optional. Subscribe to minimal field combinations necessary for your requirements.

### webhooks[object] — Mandatory
Data entity to monitor. Objects align with REST API endpoints.

### webhooks[fields] — Mandatory
Array of fields triggering notifications on change. Field names correspond to API documentation for the subscribed object.

---

**Last Updated**: May 12, 2025
