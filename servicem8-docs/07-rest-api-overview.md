# ServiceM8 API Reference Documentation

## Overview
ServiceM8 provides a comprehensive REST API for managing field service operations. The API enforces rate limits of 180 requests per minute and 20,000 per day.

## Core API Endpoints

### Allocation Windows
- **List**: `GET /allocationwindow.json` - Retrieve all scheduling windows
- **Create**: `POST /allocationwindow.json` - Add new time period for job scheduling
- **Retrieve**: `GET /allocationwindow/{uuid}.json` - Get specific window details
- **Update**: `POST /allocationwindow/{uuid}.json` - Modify existing window
- **Delete**: `DELETE /allocationwindow/{uuid}.json` - Archive a window

### Assets Management
- **List Assets**: `GET /asset.json`
- **Get Asset**: `GET /asset/{uuid}.json`
- **Update Asset**: `POST /asset/{uuid}.json`
- **Delete Asset**: `DELETE /asset/{uuid}.json`

### Asset Types & Fields
- **List/Create/Update/Delete Asset Types** at `/assettype.json` and `/assettype/{uuid}.json`
- **List/Create/Update/Delete Asset Type Fields** at `/assettypefield.json`

### Job Management
- Jobs, Job Allocations, Job Checklists, Job Contacts, Materials, Payments
- All support standard CRUD operations at endpoints like `/job.json`, `/joballocation.json`, etc.

### Client & Contact Management
- Clients, Company Contacts, Job Contacts endpoints

### Additional Resources
- Categories, Materials, Suppliers, Staff Members, Tax Rates
- Email/SMS Templates, Forms, Attachments, Notes
- Security Roles, Vendors, Document Templates

## Specialized APIs

**Messaging**: Send emails and SMS via dedicated endpoints

**Webhooks**: Manage subscriptions for object and event-based notifications

**Custom Fields**: Create and manage custom field definitions

**Document Templates**: Generate templated documents programmatically

**Provisioning**: Create new ServiceM8 accounts

**Feed API**: Post messages to activity feeds

## Authentication & Security
Endpoints require either API key or OAuth 2.0 with specific scopes (e.g., `read_schedule`, `manage_schedule`).
