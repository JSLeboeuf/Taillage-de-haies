# ServiceM8 Developer Documentation - Archive complète

Archive locale de la documentation développeur ServiceM8 récupérée depuis https://developer.servicem8.com le 2026-02-20.

## Fichiers récupérés (27 pages)

### Documentation fondamentale (1-10)
- ✅ **01-getting-started.md** - Introduction et aperçu des APIs disponibles
- ✅ **02-authentication.md** - API Key et OAuth 2.0, scopes, impersonation
- ✅ **03-http-response-codes.md** - Codes HTTP et rate limiting (180/min, 20k/jour)
- ✅ **04-addon-types.md** - Private vs Public integrations, Add-on SDK
- ✅ **05-addon-sdk.md** - Guide de démarrage Add-on SDK
- ✅ **06-serverless-addons.md** - AWS Lambda, Simple Functions, STS
- ✅ **07-rest-api-overview.md** - Vue d'ensemble complète de l'API REST
- ✅ **08-filtering.md** - Filtrage OData-style avec $filter
- ✅ **09-pagination.md** - Pagination par curseur (5000 records/page)
- ✅ **10-field-types.md** - String, Timestamp, Date, UUID, Integer, Decimal

### APIs spécialisées (11-20)
- ✅ **11-webhooks.md** - Subscriptions, verification, data format
- ✅ **12-messaging-api.md** - Email/SMS, quotas, rate limits
- ✅ **13-document-templates.md** - Génération PDF avec merge fields
- ✅ **14-custom-fields.md** - Text, Numeric, Currency, Date, DateTime, SelectList
- ✅ **15-feed-api.md** - Activity feed, organisation-wide messaging
- ✅ **16-mcp-server.md** - Model Context Protocol integration
- ✅ **17-manifest-reference.md** - Référence complète: actions, menuItems, webhooks
- ✅ **18-client-js-sdk.md** - resizeWindow, closeWindow, invoke
- ❌ **19-style-guidelines.md** - NON DISPONIBLE (404)
- ✅ **20-examples.md** - Hello World, Weather, Pool Calculator, Showcase, Webhook

### Documentation avancée (21-27)
- ✅ **21-event-data.md** - Structure événements action/webhook, JWT
- ✅ **22-faqs.md** - SSL, auth, Simple Functions limits, iOS links
- ✅ **23-how-to-guides.md** - Index des guides pratiques
- ✅ **24-your-first-addon.md** - Tutoriel complet premier add-on
- ✅ **25-addon-store.md** - Publication, billing (90/10 split), review process
- ✅ **26-addon-capabilities.md** - UI extensions, APIs disponibles
- ✅ **27-addon-structure.md** - 5 composants clés d'un add-on

## Informations clés

### Authentification
- **API Key**: Header `X-API-Key` pour intégrations privées
- **OAuth 2.0**: Pour apps publiques, tokens expiration 3600s
- **STS**: Tokens temporaires automatiques pour Lambda (900s)

### Rate Limits
- **Par minute**: 180 requêtes
- **Par jour**: 20,000 requêtes
- Throttle: HTTP 429

### Base URLs
- **API**: `https://api.servicem8.com/api_1.0/`
- **OAuth Authorize**: `https://go.servicem8.com/oauth/authorize`
- **OAuth Token**: `https://go.servicem8.com/oauth/access_token`
- **Client SDK**: `https://platform.servicem8.com/sdk/1.0/sdk.js`

### Endpoints principaux
- `/job.json` - Gestion des jobs
- `/company.json` - Gestion clients
- `/staff.json` - Gestion staff
- `/joballocation.json` - Allocation staff/jobs
- `/attachment.json` - Fichiers et photos
- `/note.json` - Notes job diary
- `/jobmaterial.json` - Matériaux
- `/jobpayment.json` - Paiements
- Voir 07-rest-api-overview.md pour la liste complète

### Scopes OAuth importants
- `read_customers` / `manage_customers`
- `read_jobs` / `manage_jobs` / `create_jobs`
- `read_staff` / `manage_staff`
- `publish_email` / `publish_sms`
- `staff_locations` (GPS temps réel)

## Add-on SDK

### Types d'add-ons
1. **Simple Function** - Hébergé par ServiceM8 (NodeJS v12)
2. **AWS Lambda** - Hébergé sur votre compte AWS
3. **Web Service** - Hébergé sur votre infrastructure (HTTPS requis)

### Composants
1. Manifest (JSON config)
2. Assets (images, JS)
3. Client Library (SDK JS)
4. Backend (Lambda/Web Service)
5. API Connectivity (REST APIs)

### Capabilities
- **Job Actions** - Boutons sur job cards
- **Client Actions** - Boutons sur client cards
- **Menu Items** - Entrées dans Add-ons menu
- **Webhooks** - Événements temps réel
- **Custom Fields** - Champs personnalisés
- **Messaging** - Email/SMS
- **Feed** - Activity stream posts
- **Document Templates** - Génération PDF

## Ressources externes

- **GitHub Examples**: https://github.com/servicem8/addon-sdk-samples
- **SDK NPM**: https://www.npmjs.com/package/servicem8
- **Support MCP**: http://support.servicem8.com/hc/en-us/articles/13811757421327
- **Developer Registration**: https://www.servicem8.com/developer-registration

## Pages non disponibles (404)

Tentées sans succès:
- `/docs/style-and-guidelines`
- `/docs/add-on-store-requirements`
- `/docs/how-to-attach-a-file-to-a-job`
- `/docs/how-to-attach-a-photo-to-a-job`
- Endpoints API individuels (`/reference/list-jobs`, etc.)

Note: Les endpoints API individuels ne sont pas documentés individuellement sur le site. La vue d'ensemble dans 07-rest-api-overview.md couvre tous les endpoints disponibles.

## Utilisation de cette archive

Cette archive est complète pour le développement d'add-ons ServiceM8. Elle contient:
- Tous les guides de démarrage
- Documentation complète de l'Add-on SDK
- Référence des APIs (REST, Webhooks, Messaging, Custom Fields, etc.)
- Exemples et FAQs
- Processus de publication au store

Pour la documentation la plus récente, consultez: https://developer.servicem8.com

## Structure des fichiers

```
servicem8-docs/
├── README.md (ce fichier)
├── 01-getting-started.md
├── 02-authentication.md
├── ... (fichiers 03-27)
└── api-reference/
    └── (répertoire pour futures références API détaillées)
```

## Changelog

**2026-02-20**: Archive initiale créée
- 27 pages de documentation récupérées
- Couverture complète: Getting Started → Add-on SDK → APIs → Examples → Store
