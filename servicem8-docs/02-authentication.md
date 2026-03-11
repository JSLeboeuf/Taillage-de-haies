# ServiceM8 Authentication Documentation

## Overview

ServiceM8 provides two primary authentication methods for API access: API Keys for private applications and OAuth 2.0 for public applications.

## Private Applications (API Key)

**Purpose:** Connecting to your own ServiceM8 account or a specific customer's account without promoting on the Add-ons Directory.

### Key Features
- No developer account required
- Generated from Settings → API Keys in your ServiceM8 account
- Simple header-based authentication

### Implementation

Include your API key in the `X-API-Key` header for all requests:

```bash
curl -X GET "https://api.servicem8.com/api_1.0/company.json" \
-H "X-API-Key: your_api_key_here" \
-H "Content-Type: application/json"
```

## Public Applications (OAuth 2.0)

**Purpose:** External apps targeting all ServiceM8 users with advanced capabilities.

### Additional Benefits
- Listing potential in ServiceM8 Add-ons Directory
- SMS and Email messaging capabilities
- Real-time webhooks
- Seamless UI integration (preferences, custom fields, badges)

### Setup Process

1. Register as a Development Partner
2. Access Developer settings in your account
3. Create a new add-on ("Add Item")
4. Receive App ID and App Secret credentials
5. Implement OAuth 2.0 authentication

### OAuth 2.0 Configuration

| Component | Value |
|-----------|-------|
| Authorize URL | `https://go.servicem8.com/oauth/authorize` |
| Token URL | `https://go.servicem8.com/oauth/access_token` |
| Grant Types | authorization_code, refresh_token |
| Token Lifetime | 3600 seconds |

## Authentication Flow

### Step 1: Initiate Authorization

Redirect users to the authorization endpoint with required parameters:

- `response_type`: "code"
- `client_id`: Your App ID
- `scope`: Space-separated requested permissions
- `redirect_uri`: (Optional) Your callback URL

**Example:**
```
https://go.servicem8.com/oauth/authorize?response_type=code&client_id=0314159&scope=read_customers%20read_jobs&redirect_uri=https%3A%2F%2Fmyapp.example.com%2FHandleOAuth
```

### Step 2: Exchange Temporary Token

POST to token endpoint with:
- `grant_type`: "authorization_code"
- `client_id`: Your App ID
- `client_secret`: Your App Secret
- `code`: Temporary token received from authorization
- `redirect_uri`: Matching original redirect URI

**Response:**
```json
{
  "access_token": "your_access_token_here",
  "expires_in": 3600,
  "token_type": "bearer",
  "scope": "read_customers read_jobs",
  "refresh_token": "your_refresh_token_here"
}
```

### Step 3: Use Access Token

Include token in API requests as Bearer authorization header or POST parameter.

### Step 4: Refresh Token

When token expires, POST to token endpoint with:
- `grant_type`: "refresh_token"
- `client_id`: Your App ID
- `client_secret`: Your App Secret
- `refresh_token`: Previously received refresh token

## OAuth Scopes

ServiceM8 supports incremental authorization, allowing permission requests at appropriate workflow moments.

### Common Scopes

| Scope | Access |
|-------|--------|
| read_customers | Company data (read-only) |
| manage_customers | Company data (full) |
| read_jobs | Job data (read-only) |
| manage_jobs | Job data (full) |
| create_jobs | Job creation ability |
| read_staff | Staff information (read-only) |
| manage_staff | Staff information (full) |
| publish_sms | SMS messaging (incurs charges) |
| publish_email | Email messaging |
| staff_locations | Real-time GPS data |

**Best Practice:** "Only scope what you need. Limiting API scopes to essentials unlocks higher rate limits."

Additional scopes available for materials, schedules, tasks, forms, assets, templates, and more.

## User Impersonation

Set the `x-impersonate-uuid` header to POST data as a specific account user. The UUID must be an active staff member in the current account. This automatically enforces user-level security restrictions.

## Access Control

Users can revoke application access anytime by disabling the add-on from the ServiceM8 Add-on Store.

### Security Note

Keep your App Secret confidential. Exposure allows unauthorized account access impersonation.
