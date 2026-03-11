# Field Types Documentation

## Overview

The ServiceM8 API documentation page covers the various data types used when working with the REST API. All timestamps follow the account's local timezone unless specified otherwise.

## Supported Field Types

### String
"No length limits unless otherwise specified. Some fields may only allow certain string values (e.g. job.status)."

### Timestamp
Format: `YYYY-MM-DD HH:II:SS` (example: "2014-11-11 09:58:31")

Uses 24-hour time format; do not include AM/PM designations. "All timestamps are in the account's local timezone unless specified otherwise."

### Date
Format: `YYYY-MM-DD`, expressed in the account's local timezone.

### UUID
A 36-character identifier for Universally Unique Identifiers. Every API-accessible object contains a UUID. "UUIDs of newly-created records are returned in the 'x-record-uuid' HTTP header on creation."

### Integer
32-bit integer values.

### Double
Double-precision floating point numbers.

### Decimal (n)
Fixed-point numbers typically used for currency values. The suffix indicates decimal place count—for example, "decimal (4)" supports four decimal places. The system accepts any number of decimal places but rounds values beyond the specified precision. For instance, storing 1.23456 in a "decimal (4)" field results in 1.2346.

## Navigation
- Previous: [Pagination](/docs/pagination)
- Next: [How-to Guides](/docs/how-to-guides)
