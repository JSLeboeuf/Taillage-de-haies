# Add-on Types

## Overview

ServiceM8 provides multiple integration approaches depending on your development goals.

## Integration Types

### Private Integration

The simplest option connects directly to the REST API using an API Key. This approach suits "one-off integrations or scripts developed for one company."

### Public Integrations

After registering for a developer account and creating a Store Item, your add-on receives OAuth 2.0 credentials. These integrations can access all ServiceM8 APIs including REST, Webhooks, and messaging services. You manage user accounts independently, though ServiceM8 can optionally handle billing.

### Add-on SDK

To extend the ServiceM8 user interface with buttons or menu items, use the Add-on SDK with a required Manifest file. This approach enables Serverless OAuth, where "ServiceM8 issues you a temporary OAuth token each time a user needs to invoke your add-on's functionality."

#### Three Implementation Methods

**Simple Function Add-on**
ServiceM8 manages infrastructure and invokes your Lambda function responding to webhooks or UI clicks.

**AWS Lambda Function Add-on**
Host Lambda functions in your AWS account, enabling integration with DynamoDB, S3, and other AWS services.

**Web Service Hosted Add-on**
Define a callback URL that receives event information as a JWT signed with your App Secret, suitable for existing server infrastructure.

## Additional Resources

- [Examples](/docs/examples) showcase Add-on SDK possibilities
- [Getting Started](/docs/getting-started-1) provides foundational guidance
- [Serverless Add-ons](/docs/serverless-add-ons) details deployment options
