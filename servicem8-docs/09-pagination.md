# Pagination Documentation

## Overview

The ServiceM8 API employs cursor-based pagination to manage large datasets efficiently. This approach provides a scalable way to retrieve records in manageable chunks.

## How It Works

The pagination process follows these steps:

1. **Initial Request**: Include `cursor=-1` as a query parameter in your API request
2. **Response**: The API returns up to 5,000 records per response
3. **Next Page**: Each response includes an `x-next-cursor` HTTP header containing a UUID for subsequent pages
4. **Subsequent Requests**: Use the UUID from `x-next-cursor` as the cursor value in your next request
5. **Final Page**: When you've retrieved all records, the `x-next-cursor` header will be absent

## Example Implementation

**Initial Request:**
```
GET /api_1.0/job.json?cursor=-1
```

**Response Headers:**
```
x-next-cursor: 550e8400-e29b-41d4-a716-446655440000
```

**Next Request:**
```
GET /api_1.0/job.json?cursor=550e8400-e29b-41d4-a716-446655440000
```

Continue this pattern until no `x-next-cursor` header is returned, indicating all available records have been retrieved.

## TypeScript Users

For developers using TypeScript, the ServiceM8 SDK provides automatic pagination support, eliminating manual cursor management.

**SDK Package**: https://www.npmjs.com/package/servicem8
