# ServiceM8 API Endpoints - Référence complète

Base URL: `https://api.servicem8.com/api_1.0/`

## Pattern CRUD standard

La plupart des endpoints suivent ce pattern:

```
GET    /{resource}.json              # List all (avec pagination cursor=-1)
POST   /{resource}.json              # Create new
GET    /{resource}/{uuid}.json       # Get one
POST   /{resource}/{uuid}.json       # Update one
DELETE /{resource}/{uuid}.json       # Delete/archive one
```

## Jobs & Scheduling

### Jobs
- `GET/POST /job.json` - Liste/Création jobs
- `GET/POST/DELETE /job/{uuid}.json` - Opérations sur job spécifique
- Champs clés: `uuid`, `status`, `company_uuid`, `job_address`, `total_price`, `active`

### Job Allocations
- `/joballocation.json` - Assignation staff aux jobs
- Scope requis: `read_schedule` / `manage_schedule`

### Job Activities
- `/jobactivity.json` - Tracking activités sur jobs

### Job Contacts
- `/jobcontact.json` - Contacts liés aux jobs

### Job Materials
- `/jobmaterial.json` - Matériaux utilisés sur jobs

### Job Payments
- `/jobpayment.json` - Paiements reçus pour jobs

### Job Queues
- `/jobqueue.json` - Files d'attente de jobs

### Tasks
- `/task.json` - Tâches individuelles au sein des jobs

## Clients & Contacts

### Companies (Clients)
- `GET/POST /company.json` - Liste/Création clients
- `GET/POST/DELETE /company/{uuid}.json`
- Champs: `uuid`, `name`, `email`, `mobile`, `address`

### Company Contacts
- `/companycontact.json` - Contacts multiples par client

### Locations
- `/location.json` - Adresses/emplacements clients

## Assets

### Assets
- `/asset.json` - Gestion des actifs (équipements clients)
- `GET/POST/DELETE /asset/{uuid}.json`

### Asset Types
- `/assettype.json` - Types d'actifs configurables

### Asset Type Fields
- `/assettypefield.json` - Champs personnalisés pour types d'actifs

## Staff & Scheduling

### Staff
- `/staff.json` - Gestion employés
- Scope: `read_staff` / `manage_staff`

### Security Roles
- `/securityrole.json` - Rôles et permissions staff

### Allocation Windows
- `/allocationwindow.json` - Fenêtres de temps pour scheduling
- Scope: `read_schedule` / `manage_schedule`

## Content & Communication

### Attachments
- `/attachment.json` - Fichiers, photos, documents
- Upload via multipart/form-data
- Champs: `file`, `related_object`, `related_object_uuid`

### Notes
- `/note.json` - Notes job diary
- Visible dans job history

### Form Responses
- `/formresponse.json` - Réponses aux formulaires custom

### Categories
- `/category.json` - Catégories de jobs

### Badges
- `/badge.json` - Badges/tags pour jobs

## Inventory & Finance

### Materials
- `/material.json` - Inventaire matériaux

### Tax Rates
- `/taxrate.json` - Taux de taxe

### Vendor Payments
- `/vendorpayment.json` - Paiements aux fournisseurs

## APIs spécialisées

### Webhooks
- `GET/POST /webhook_subscriptions.json` - Gestion subscriptions
- `DELETE /webhook_subscriptions/{uuid}.json` - Suppression
- Vérification challenge requis pour OAuth apps

### Messaging
- `POST /email.json` - Envoi emails
  - Scope: `publish_email`
  - Rate limit: variable selon quota account
- `POST /sms.json` - Envoi SMS
  - Scope: `publish_sms`
  - Coûts SMS facturés au compte

### Custom Fields
- `GET/POST /customfield.json` - Définitions champs custom
- `GET/POST/DELETE /customfield/{uuid}.json`
- Types: Text, Numeric, Currency, Date, DateTime, SelectList
- Accès via prefix: `customfield_{field_name}`

### Document Templates
- `POST /documenttemplate/generate.json` - Génération PDFs
- Merge fields depuis objects ServiceM8
- Retourne URL du PDF généré

### Feed API
- `POST /feed.json` - Publication activity feed
- Visible à tous staff members account

### Provisioning
- `POST /provision.json` - Création nouveaux comptes ServiceM8
- Scope spécial requis

## Paramètres de requête

### Pagination
```
?cursor=-1                    # Première page
?cursor={uuid}                # Page suivante (depuis x-next-cursor header)
```
Max 5000 records par page

### Filtrage
```
?$filter=active eq 1
?$filter=status eq 'Work Order' and total_price gt 1000
```
- Opérateurs: `eq`, `ne`, `gt`, `lt`
- Max 10 conditions avec `and`
- Pas de support `or` ou `not`

### Tri
```
?$sort=create_date desc
```

## Headers importants

### Request
```
X-API-Key: {your_api_key}           # Pour API Key auth
Authorization: Bearer {token}        # Pour OAuth
Content-Type: application/json
x-impersonate-uuid: {staff_uuid}    # User impersonation (OAuth)
```

### Response
```
x-record-uuid: {uuid}               # UUID du record créé
x-next-cursor: {uuid}               # Cursor pour page suivante
```

## Exemples

### Lister jobs actifs
```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.servicem8.com/api_1.0/job.json?cursor=-1&\$filter=active%20eq%201"
```

### Créer un client
```bash
curl -X POST \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"ACME Corp","email":"contact@acme.com"}' \
  "https://api.servicem8.com/api_1.0/company.json"
```

### Récupérer un job
```bash
curl -H "X-API-Key: YOUR_KEY" \
  "https://api.servicem8.com/api_1.0/job/550e8400-e29b-41d4-a716-446655440000.json"
```

### Subscribe webhook
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"object":"job","fields":["status","total_price"],"callback_url":"https://your-domain.com/webhook"}' \
  "https://api.servicem8.com/webhook_subscriptions.json"
```

## Statuts de job standards

- Quote
- Work Order
- In Progress
- Completed
- Cancelled

## Codes d'erreur courants

- `400` - Validation error (champs invalides)
- `401` - Auth failed (API key ou token invalide)
- `403` - Forbidden (scope insuffisant)
- `404` - Resource not found
- `429` - Rate limit exceeded
- `500` - Server error

## Best Practices

1. **Pagination**: Toujours utiliser `cursor=-1` pour lister
2. **Filtrage**: Filtrer côté serveur plutôt que client
3. **Rate Limits**: Implémenter retry logic avec backoff
4. **Scopes**: Demander uniquement les scopes nécessaires
5. **UUIDs**: Stocker les UUIDs, pas les IDs internes
6. **Webhooks**: Valider le challenge, retourner 200 rapidement
7. **Timestamps**: Utiliser timezone du compte (sauf webhooks = UTC)

## Documentation complète

Voir les fichiers markdown numérotés pour la documentation détaillée de chaque API.
