# ServiceM8 REST API Filtering Documentation

## Overview

The ServiceM8 REST API supports OData-style filtering through the `$filter` query parameter, enabling "retrieval of specific subsets of resources based on field values and conditions."

## Basic Filter Syntax

### Single Condition
```
GET /api_1.0/{resource}.json?$filter={field} {operator} {value}
```

### Examples
```bash
# Get all active jobs
GET /api_1.0/job.json?$filter=active eq 1

# Get jobs with a specific status
GET /api_1.0/job.json?$filter=status eq 'Work Order'

# Get companies created after a specific date
GET /api_1.0/company.json?$filter=create_date gt '2023-01-01'
```

## Supported Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equal to | `status eq 'Quote'` |
| `ne` | Not equal to | `status ne 'Completed'` |
| `gt` | Greater than | `total_price gt 1000` |
| `lt` | Less than | `total_price lt 5000` |

**Note:** "Greater than or equal (`ge`) and less than or equal (`le`) operators are not currently supported."

## Multiple Conditions with AND

The API supports combining conditions using the `and` operator, with a maximum of 10 conditions per request.

### Syntax
```
$filter={condition1} and {condition2} and {condition3}
```

### Examples
```bash
# Jobs with status 'Work Order' AND active
GET /api_1.0/job.json?$filter=status eq 'Work Order' and active eq 1

# Jobs with high value AND specific company
GET /api_1.0/job.json?$filter=total_price gt 1000 and company_uuid eq '550e8400-e29b-41d4-a716-446655440000'

# Complex filter with multiple conditions
GET /api_1.0/job.json?$filter=status eq 'Work Order' and active eq 1 and total_price gt 500 and total_price lt 5000
```

### Limitations

- Maximum of 10 conditions per request
- "Only `and` operator is supported (no `or` or `not`)"
- No support for parentheses/grouping

For complex filtering needs: break queries into multiple API requests, use results from one to filter subsequent requests, or consider webhooks/batch processing.

## Value Formatting

### String Values
String values must be enclosed in single quotes:
```
$filter=name eq 'John Smith'
$filter=status eq 'Work Order'
```

### Numeric Values
Numeric values should not be quoted:
```
$filter=active eq 1
$filter=total_price gt 1000.50
```

### Special Characters in Strings
```
$filter=name eq 'Smith & Sons Plumbing'
$filter=address eq '123 Main St, Suite 100'
```

## Field Value Limitations

- Maximum length of any filter value: 255 characters
- Field names must be valid API fields for the resource type
- Field names are case-sensitive

## Error Handling

### Common Errors

**Invalid Filter Format:**
```json
{
  "errorCode": 400,
  "message": "Invalid Record Filter Specified"
}
```

**Too Many Conditions:**
```json
{
  "errorCode": 400,
  "message": "Maximum of 10 filter conditions allowed. Please reduce the number of conditions or use multiple requests."
}
```

**Unsupported Operators:**
```json
{
  "errorCode": 400,
  "message": "OR and NOT operators are not supported. Use multiple requests or contact support."
}
```

**Invalid Field Name:**
```json
{
  "errorCode": 400,
  "message": "Invalid Record Filter Field Specified"
}
```

**Value Too Long:**
```json
{
  "errorCode": 400,
  "message": "Record Filter Value is too long"
}
```

## URL Encoding

Remember to properly URL encode filter expressions:

```bash
# Unencoded (for readability)
GET /api_1.0/job.json?$filter=status eq 'Work Order' and active eq 1

# URL encoded (actual request)
GET /api_1.0/job.json?%24filter=status%20eq%20%27Work%20Order%27%20and%20active%20eq%201
```

## Working Examples with cURL

### Single Condition
```bash
curl -X GET "https://api.servicem8.com/api_1.0/job.json?%24filter=active%20eq%201" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Multiple Conditions
```bash
curl -X GET "https://api.servicem8.com/api_1.0/job.json?%24filter=status%20eq%20%27Work%20Order%27%20and%20active%20eq%201%20and%20total_price%20gt%201000" \
  -H "X-API-Key: YOUR_API_KEY"
```

### Complex Business Query
```bash
curl -X GET "https://api.servicem8.com/api_1.0/job.json?%24filter=company_uuid%20eq%20%27550e8400-e29b-41d4-a716-446655440000%27%20and%20status%20ne%20%27Completed%27%20and%20total_price%20gt%202000%20and%20active%20eq%201" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Combining with Other Parameters

Filters work alongside other API parameters:

```bash
# Filter with sorting
GET /api_1.0/job.json?$filter=status eq 'Work Order'&$sort=due_date desc

# Filter with cursor-based pagination
GET /api_1.0/job.json?$filter=active eq 1&cursor=-1
```

## Performance Best Practices

1. **Use Indexed Fields:** Filter on fields like `uuid`, `active`, and `status` for optimal performance
2. **Be Specific:** More conditions typically result in smaller, faster result sets
3. **Avoid Complex Logic:** For OR conditions, make separate requests
4. **Cache When Possible:** Cache filtered results that don't change frequently
5. **Consider Pagination:** Use cursor-based pagination for large result sets

## Related Documentation

- [REST API Authentication](/docs/authentication)
- [REST API Pagination](/docs/pagination)
