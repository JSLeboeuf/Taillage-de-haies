# Custom Fields API - Overview

## Key Information

The **Custom Fields API** enables developers to add supplementary fields to the standard database schema on a per-account basis. This functionality is exclusively available to public applications implementing OAuth 2.0 authentication.

## Primary Use Cases

According to the documentation, custom fields commonly serve to:

- Gather supplementary job or client details
- Integrate with webhooks for triggering automated workflows

## When to Implement Custom Fields

The documentation advises cautious implementation: "Custom fields slow down user data entry and complicate the user interface." Developers should use them sparingly and only when alternative solutions prove inadequate. The platform recommends storing information in Notes or Photos instead, unless structured data storage is specifically required.

## Supported Object Types

Custom fields work with:
- Job records
- Company records

## Available Field Types

| Type | Purpose |
|------|---------|
| **Text** | Single-line textbox (no multiline support) |
| **Numeric** | Numeric-only storage for mathematical operations |
| **Currency** | Currency values with region-based symbols |
| **Date** | Date values (YYYY-MM-DD format via API) |
| **DateTime** | Timestamp data (YYYY-MM-DD HH:MM:SS format via API) |
| **SelectList** | Dropdown menus with predefined options |

## API Integration

Once created, custom fields become accessible through the REST API with a `customfield_` prefix. A field named `favourite_ice_cream` becomes `customfield_favourite_ice_cream` in REST calls.

**Note:** SelectList validation occurs at creation only; API updates bypass dropdown option verification.
