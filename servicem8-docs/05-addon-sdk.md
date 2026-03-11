# Getting Started - ServiceM8 Add-on SDK

## Introduction

ServiceM8 offers an Add-on SDK for developers to extend the platform. Unlike API-only solutions, add-ons provide "additional functionality on top of the ServiceM8 platform and enhance the UX of the web and mobile app."

### Key Benefits

**For ServiceM8 Customers:**
- Simple activation without external sign-ups
- Add-on fees included in monthly billing
- Familiar user experience within the platform

**For Developers:**
- Built-in discovery through ServiceM8 Add-on Store
- Higher adoption rates due to streamlined onboarding
- Flexible pricing options (including free models)
- Simplified payment processing for micro-transactions
- Support for both web and mobile app extensions

## Hosting Options

### Serverless (AWS Lambda)
Run code in the cloud without server management. Supports Java, Node.js, and Python. ServiceM8 sends requests to your Lambda function, which processes them and returns responses. This is the "easiest and recommended way to host the service for an add-on."

### Web Service Hosted
Deploy a custom web service on any cloud provider. Must accept HTTPS requests. ServiceM8 sends requests to your endpoint, and your service processes and responds.

## Authentication

Add-ons use OAuth for authentication with ServiceM8 accounts, similar to external integrations. For serverless add-ons, ServiceM8 manages the OAuth flow—simply leave the Activation URL blank and users can press 'Connect' in the Add-on Directory to complete the process.

Specify required OAuth scopes in the Add-on Manifest.

## Getting Started Resources

Sample add-ons are available at:
https://github.com/servicem8/addon-sdk-samples

### Next Steps
- Explore [Serverless Add-ons](/docs/serverless-add-ons)
- Learn about [Web Service Hosted Add-ons](/docs/web-service-hosted-add-ons)
- Build [Your First Add-on](/docs/your-first-add-on)
