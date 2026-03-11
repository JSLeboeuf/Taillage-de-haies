# Frequently Asked Questions

## AWS Lambda & SSL Certificates

**Q: Do I need to setup and manage an SSL Certificate when using AWS Lambda?**

No SSL certificate management is required. "When using AWS Lambda you don't need to manage any SSL certificates as ServiceM8 invokes your Lambda function directly."

## Authentication in Add-on Functions

**Q: How do I authenticate against the ServiceM8 API within my function?**

The platform provides built-in authentication through the ServiceM8 Simple Token Service. This automatically furnishes temporary OAuth tokens for each function invocation, eliminating manual authentication complexity.

## Simple Functions Limitations

**Q: What are the limitations of Simple Functions?**

| Resource | Limit |
|----------|-------|
| Maximum execution duration per request | 15 seconds |
| Maximum Memory per request | 128 MB |
| Languages Supported | Node.js (JavaScript) |

## iOS App Navigation

**Q: How can I switch back to the ServiceM8 iOS app after launching from an action?**

ServiceM8 supports iOS Universal Links. Use this URL to return to the app:

```
https://go.servicem8.com/app/launch
```

## Opening Jobs in Browser

**Q: How can I send users to an existing job in their browser?**

Direct web users to specific jobs using the UUID with this URL format:

```
https://go.servicem8.com/openjob/{uuid}
```

When opened in a browser where users are already authenticated, it navigates directly to that job's details page, creating seamless integration between web workflows and ServiceM8.
