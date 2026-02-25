# Add-on Capabilities

## Overview

ServiceM8 add-ons can extend functionality through two primary methods: extending the user interface and leveraging various APIs.

## Extend the ServiceM8 UI

Add-ons support three UI extension approaches:

### Job Actions
- Insert one or more actions within job cards
- Available for web, app, or both platforms
- Enables contextual operations directly on job records

### Client Actions
- Add one or more actions within client cards
- Support web, app, or both deployment options
- Streamlines client-related workflows

### Add-on Menu Items
- Create new menu entries in ServiceM8
- Web: appears under 'Add-ons' menu
- Mobile: located in 'More…' menu
- Provides dedicated canvas for add-on rendering within ServiceM8 interface

## Extend via ServiceM8 APIs

### REST API
Leverage the REST API to "receive and change account data" using OAuth credentials for authentication.

### Messaging Capabilities
- **Email**: Send emails leveraging pre-set customer signatures without managing reply infrastructure
- **SMS/Text**: Transmit text messages on behalf of accounts

### Activity Feed Integration
Post multiple content types visible across web and mobile:
- Text posts
- Image posts
- Video posts
- Posts can include actions enabling user navigation or task completion

### PDF Document Generation
"Produce PDF documents populated with ServiceM8 account data, such as quote and invoice templates"

### Custom Fields
"Add unique custom fields to each ServiceM8 account" for enhanced data organization

---

**Navigation**: [Getting Started](/docs/getting-started-1) | [Add-on Structure](/docs/add-on-structure)
