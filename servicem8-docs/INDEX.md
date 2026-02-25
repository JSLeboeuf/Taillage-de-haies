# ServiceM8 Documentation - Index de navigation

Navigation rapide dans l'archive de documentation ServiceM8.

## Démarrage rapide

**Nouveau développeur?** Lire dans cet ordre:
1. [Getting Started](01-getting-started.md) - Vue d'ensemble
2. [Authentication](02-authentication.md) - API Key vs OAuth
3. [Your First Add-on](24-your-first-addon.md) - Tutoriel pratique
4. [Examples](20-examples.md) - Code samples

**Intégration API simple?**
1. [Authentication](02-authentication.md) - Obtenir API Key
2. [REST API Overview](07-rest-api-overview.md) - Endpoints disponibles
3. [Filtering](08-filtering.md) - Filtrer les données
4. [Pagination](09-pagination.md) - Parcourir les résultats
5. [API Reference](api-reference/endpoints-overview.md) - Détails techniques

**Créer un Add-on?**
1. [Add-on SDK](05-addon-sdk.md) - Introduction
2. [Add-on Types](04-addon-types.md) - Choisir le type
3. [Add-on Capabilities](26-addon-capabilities.md) - Ce qui est possible
4. [Add-on Structure](27-addon-structure.md) - Architecture
5. [Serverless Add-ons](06-serverless-addons.md) - Option recommandée
6. [Manifest Reference](17-manifest-reference.md) - Configuration

## Par sujet

### Authentification & Sécurité
- [02-authentication.md](02-authentication.md) - API Key, OAuth 2.0, scopes
- [03-http-response-codes.md](03-http-response-codes.md) - Codes erreur, rate limits

### API REST
- [07-rest-api-overview.md](07-rest-api-overview.md) - Vue d'ensemble
- [08-filtering.md](08-filtering.md) - OData $filter
- [09-pagination.md](09-pagination.md) - Curseur pagination
- [10-field-types.md](10-field-types.md) - Types de données
- [api-reference/endpoints-overview.md](api-reference/endpoints-overview.md) - Référence complète

### Add-on SDK
- [05-addon-sdk.md](05-addon-sdk.md) - Getting Started
- [04-addon-types.md](04-addon-types.md) - Private vs Public vs SDK
- [26-addon-capabilities.md](26-addon-capabilities.md) - Capabilities disponibles
- [27-addon-structure.md](27-addon-structure.md) - 5 composants clés
- [06-serverless-addons.md](06-serverless-addons.md) - Lambda & STS
- [17-manifest-reference.md](17-manifest-reference.md) - Config JSON
- [18-client-js-sdk.md](18-client-js-sdk.md) - SDK JavaScript
- [21-event-data.md](21-event-data.md) - Structure événements
- [20-examples.md](20-examples.md) - Exemples complets
- [24-your-first-addon.md](24-your-first-addon.md) - Tutorial

### APIs spécialisées
- [11-webhooks.md](11-webhooks.md) - Webhooks temps réel
- [12-messaging-api.md](12-messaging-api.md) - Email & SMS
- [13-document-templates.md](13-document-templates.md) - Génération PDF
- [14-custom-fields.md](14-custom-fields.md) - Champs personnalisés
- [15-feed-api.md](15-feed-api.md) - Activity feed
- [16-mcp-server.md](16-mcp-server.md) - Model Context Protocol

### Publication & Store
- [25-addon-store.md](25-addon-store.md) - Publication, billing, review
- [22-faqs.md](22-faqs.md) - Questions fréquentes

### Guides pratiques
- [23-how-to-guides.md](23-how-to-guides.md) - Index guides
- [01-getting-started.md](01-getting-started.md) - Intro générale

## Par type de développeur

### Je veux... lire des données
→ [Authentication](02-authentication.md) → [REST API Overview](07-rest-api-overview.md) → [Filtering](08-filtering.md)

### Je veux... être notifié des changements
→ [Webhooks](11-webhooks.md) → [Event Data](21-event-data.md)

### Je veux... envoyer des emails/SMS
→ [Messaging API](12-messaging-api.md) → [Authentication](02-authentication.md) (OAuth requis)

### Je veux... ajouter un bouton dans ServiceM8
→ [Add-on SDK](05-addon-sdk.md) → [Your First Add-on](24-your-first-addon.md) → [Manifest Reference](17-manifest-reference.md)

### Je veux... stocker des données custom
→ [Custom Fields](14-custom-fields.md) ou [Notes via REST API](api-reference/endpoints-overview.md)

### Je veux... générer des PDFs
→ [Document Templates](13-document-templates.md)

### Je veux... publier dans le store
→ [Add-on Store](25-addon-store.md) → [Add-on Capabilities](26-addon-capabilities.md)

## Référence rapide

### URLs importantes
- API Base: `https://api.servicem8.com/api_1.0/`
- OAuth Authorize: `https://go.servicem8.com/oauth/authorize`
- OAuth Token: `https://go.servicem8.com/oauth/access_token`
- Client SDK: `https://platform.servicem8.com/sdk/1.0/sdk.js`

### Rate Limits
- 180 requêtes/minute
- 20,000 requêtes/jour

### Scopes OAuth courants
- `read_customers`, `manage_customers`
- `read_jobs`, `manage_jobs`, `create_jobs`
- `read_staff`, `manage_staff`
- `publish_email`, `publish_sms`

### Endpoints fréquents
- `/job.json` - Jobs
- `/company.json` - Clients
- `/staff.json` - Employés
- `/attachment.json` - Fichiers
- `/note.json` - Notes

Voir [endpoints-overview.md](api-reference/endpoints-overview.md) pour la liste complète.

## Ressources externes

- GitHub Examples: https://github.com/servicem8/addon-sdk-samples
- NPM SDK: https://www.npmjs.com/package/servicem8
- Developer Portal: https://developer.servicem8.com
- Developer Registration: https://www.servicem8.com/developer-registration

## Fichiers manquants

Ces pages n'ont pas pu être récupérées (404):
- `19-style-guidelines.md` - Guidelines de design
- Guides spécifiques: attach file/photo to job
- Add-on store requirements détaillés

Pour la documentation la plus récente, visitez: https://developer.servicem8.com

---

**Dernière mise à jour**: 2026-02-20
**Total pages**: 27 + 1 référence API
**Total lignes**: ~1,690
