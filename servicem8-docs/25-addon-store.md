# ServiceM8 Add-on Store Documentation

## Overview

The ServiceM8 Add-on Store enables developers to publish public applications targeting all ServiceM8 users. Public add-ons become eligible for listing in the ServiceM8 Add-on Directory.

### Key Benefits

- Application promotion to thousands of ServiceM8 users
- Revenue sharing options with flexible billing models via the billing API

## Billing Strategy Selection

Before submitting an add-on to the directory, developers must establish a billing approach.

### Option 1: ServiceM8 Platform Billing

ServiceM8 handles payment processing directly. Key features include:

- Monthly fees charged automatically with customer ServiceM8 bills
- Monthly payouts processed via Stripe
- Support for micro-recurring fees
- "90% to developer, 10% to ServiceM8" revenue split

**Important:** ServiceM8 retains discretionary refund authority for up to 90 days, with refunds deducted from developer payouts.

### Option 2: Direct Customer Charging

Developers manage their own payment infrastructure independently. The add-on lists as free in the store with no ServiceM8 involvement in billing or payment processing.

## Submission and Review Process

### Pre-Submission Preparation

Ensure seamless installation experiences by:

- Testing thoroughly using the Private Add-on Install URL
- Documenting setup requirements clearly
- Explaining third-party integrations when applicable

### Review Stages

1. **Submission** - Complete store listing per Add-on Store Requirements
2. **Assessment** - ServiceM8 team evaluates for Partner Preview approval or provides feedback
3. **Partner Preview** - Limited release to partners and support team for familiarization
4. **Public Release** - Full availability in the ServiceM8 add-on store (if no issues arise)
5. **Ongoing Monitoring** - ServiceM8 monitors feedback and expects prompt issue resolution

## Related Resources

- [Add-on Store Requirements](/docs/addon-store-requirements)
- [Add-on Types](/docs/add-on-types)
