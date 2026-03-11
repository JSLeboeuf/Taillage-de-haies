# Serverless Add-ons Documentation

## Overview

ServiceM8 enables add-on development without server management overhead. These can be hosted directly on ServiceM8's infrastructure or through AWS Lambda.

> "AWS Lambda is a serverless compute service that automatically manages the underlying compute resources for you, from a few requests per day to thousands per second."

## Simple Function Add-on

ServiceM8 handles all infrastructure requirements when you set up a Simple Function Add-on—you provide the code and the platform executes it. Modify your code via the **Edit Function** button in your add-on's settings page.

**Language Requirement:** NodeJS v12 is mandatory for Simple Functions. For Python, C#, or Java support, use Web Service hosted add-ons instead.

Refer to the Event Data documentation for details on function invocation parameters.

## ServiceM8 Secure Token Service

This service streamlines add-on communication with the ServiceM8 API via OAuth, eliminating the need to manage access tokens manually in serverless environments.

**Key Features:**
- Automatic issuance of short-lived access tokens (900 seconds)
- Token provided with each Lambda function invocation
- Immediate API access without additional OAuth flow
- Scope control via manifest configuration

The access token is delivered as part of event data and can be used directly against ServiceM8 APIs. Token permissions align with OAuth scopes specified in your add-on's manifest file.

## Next Steps

- Review [Event Data](/docs/sample-event-data) for invocation details
- Explore [Examples](/docs/examples) for implementation patterns
