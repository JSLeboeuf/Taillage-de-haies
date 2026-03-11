# Intégration ServiceM8 — Agent IA de Soumission

## Vue d'ensemble

Architecture technique pour connecter un agent IA (voice + web) à ServiceM8 pour automatiser la qualification de leads et la création de soumissions pour Haie Lite.

---

## 1. API ServiceM8

### Base URL
```
https://api.servicem8.com/api_1.0/
```

### Endpoints principaux

| Ressource | Endpoint | Méthodes | Scope OAuth |
|---|---|---|---|
| Jobs | `/job.json` | GET, POST, DELETE | read_jobs, create_jobs |
| Clients | `/company.json` | GET, POST, DELETE | read_clients, create_clients |
| Contacts | `/companycontact.json` | GET, POST, DELETE | — |
| Bookings | `/jobactivity.json` | GET, POST, DELETE | read_schedule, manage_schedule |
| Staff | `/staff.json` | GET | — |
| SMS | `/platform_service_sms` | POST | — |
| Webhooks | `/webhook_subscriptions/event` | GET, POST, DELETE | — |

### Authentication

**Option 1: API Key (recommandé pour Haie Lite)**
```bash
curl -X GET "https://api.servicem8.com/api_1.0/company.json" \
  -H "X-API-Key: your_api_key_here"
```
Générer: Settings > ServiceM8 Add-ons > Generate API Key

**Option 2: OAuth 2.0** (pour app multi-clients)
- Authorization URL: `https://go.servicem8.com/oauth/authorize`
- Token URL: `https://go.servicem8.com/oauth/access_token`
- Scopes: read_jobs, create_jobs, read_clients, create_clients, manage_schedule

### Rate Limits
- 180 requêtes/minute
- 20 000 requêtes/jour
- HTTP 429 si dépassé

### Filtrage (OData)
```bash
# Par statut
GET /api_1.0/job.json?$filter=status eq 'Quote'

# Par date
GET /api_1.0/job.json?$filter=create_date gt '2026-01-01'

# Combiner (max 10 conditions)
GET /api_1.0/job.json?$filter=status eq 'Work Order' and active eq 1
```
Opérateurs: `eq`, `ne`, `gt`, `lt`, `and` (PAS de `ge`/`le`)

### Pagination (cursor-based)
```bash
GET /api_1.0/job.json?cursor=-1          # première page
GET /api_1.0/job.json?cursor=<last-uuid>  # pages suivantes
```
Header `x-next-cursor` absent = dernière page.

---

## 2. Structures JSON

### Company (Client)
```json
{
  "name": "Jean Tremblay",
  "address": "123 rue Principale, Laval, QC H7A 1A1",
  "address_street": "123 rue Principale",
  "address_city": "Laval",
  "address_state": "QC",
  "address_postcode": "H7A 1A1",
  "address_country": "Canada"
}
```

### CompanyContact
```json
{
  "company_uuid": "<uuid>",
  "first": "Jean",
  "last": "Tremblay",
  "email": "jean@example.com",
  "mobile": "+15141234567"
}
```

### Job
```json
{
  "company_uuid": "<uuid>",
  "job_address": "123 rue Principale, Laval, QC H7A 1A1",
  "status": "Quote",
  "description": "Taille de haie cèdre - 15m x 2m",
  "job_is_quoted": "1"
}
```
Status: `Quote`, `Work Order`, `Completed`, `Unsuccessful`

### JobActivity (Booking)
```json
{
  "job_uuid": "<uuid>",
  "staff_uuid": "<uuid>",
  "start_date": "2026-02-28 09:00:00",
  "end_date": "2026-02-28 12:00:00",
  "activity_was_scheduled": "1"
}
```

---

## 3. Webhooks

### Événements clés
- `job.created` / `job.updated` / `job.status_changed`
- `job.completed` / `job.quote_sent` / `job.quote_accepted`
- `job.invoice_sent` / `job.invoice_paid`
- `company.created` / `company.updated`
- `inbox.message_received`

### S'abonner
```bash
curl -X POST "https://api.servicem8.com/webhook_subscriptions/event" \
  -H "X-API-Key: your_api_key" \
  -d '{"event": "job.created", "callback_url": "https://your-app.com/webhooks/servicem8"}'
```

### Vérification (challenge)
ServiceM8 envoie `{"mode": "subscribe", "challenge": "random_string"}`.
Répondre avec la valeur `challenge` en texte brut.

### Payload webhook
```json
{
  "object": "job",
  "entry": [{"uuid": "...", "changed_fields": ["status"], "time": "..."}],
  "resource_url": "https://api.servicem8.com/api_1.0/job/<uuid>.json"
}
```
**Important:** Le webhook ne contient PAS l'objet complet. Faire GET sur `resource_url`.

---

## 4. Architecture Agent IA

```
FRONTEND (Channels)
├── Vapi.ai (Voice)
├── Next.js App (Web Form)
└── WhatsApp/SMS (Future)
         ↓
AI QUALIFICATION ENGINE
├── Vercel Edge Functions
├── GPT-4 (extraction: nom, adresse, type haie, dimensions)
└── Validation: format téléphone QC, adresse
         ↓
SCHEDULING INTELLIGENCE
├── Query ServiceM8 JobActivity API
├── Check crew availability
└── Suggest 3 available slots
         ↓
SERVICEM8 INTEGRATION
├── 1. Create Company (si nouveau)
├── 2. Create CompanyContact
├── 3. Create Job (status: Quote)
├── 4. Create JobActivity (booking)
└── 5. Send SMS confirmation
         ↓
NOTIFICATIONS
├── SMS client (ServiceM8 API)
├── Email confirmation
└── Webhook interne Slack/Discord
```

### Flow: Appel → Job ServiceM8

```typescript
// 1. Réception lead (Vapi webhook ou formulaire)
// 2. Extraction GPT-4 (nom, adresse, type haie, dimensions, date préférée)
// 3. Check disponibilité via /jobactivity.json
// 4. POST /company.json → récupérer x-record-uuid
// 5. POST /companycontact.json
// 6. POST /job.json (status: Quote)
// 7. POST /jobactivity.json (booking)
// 8. POST /platform_service_sms (confirmation)
```

---

## 5. Intégrations existantes

### Zapier
- Triggers: Job status change, New client, New job, Form completed
- Actions: Create job, Create client

### Make.com
- Triggers: Watch jobs, Watch clients, Watch forms
- Actions: Create/Update client, Create job, Custom API call

### n8n
- Node natif ServiceM8

### Voice AI existantes
- **ServiceM8 Phone Agent** (natif, plans Connect Plus+)
- **Whippy AI** — partenaire officiel, voice + SMS automation
- **Pod AI (CallPod)** — voice automation field service

---

## 6. Stack technique recommandé

| Composant | Outil |
|---|---|
| Voice AI | Vapi.ai |
| Backend | Next.js 14 App Router + Vercel Edge |
| Database | Supabase (tracking leads, cache disponibilité) |
| Auth ServiceM8 | API Key (1 compte) |
| LLM | GPT-4 (qualification) |
| Monitoring | Sentry + PostHog |

## 7. Pièges à éviter

1. L'API ne retourne PAS congés/fermetures → gérer localement
2. Rate limits → retry logic avec backoff exponentiel
3. Webhooks ne contiennent pas l'objet complet → toujours fetch resource_url
4. Pas de `ge`/`le` operators → utiliser `gt`/`lt` avec dates ajustées
5. Timestamps en timezone local du compte → ne pas convertir en UTC
6. UUID auto-généré → toujours lire `x-record-uuid` header après POST

## 8. Prochaines étapes

1. Générer API Key dans ServiceM8 (Settings > Add-ons)
2. Tester endpoints avec curl/Postman
3. Créer compte Vapi.ai et configurer function calling
4. Développer Next.js API routes pour orchestration
5. Implémenter webhook handler
6. Tester flow complet end-to-end
7. Monitorer latence voice (< 500ms target)

---

*Compilé le 19 février 2026*
*Source: ServiceM8 Developer Portal, Vapi.ai docs, recherche intégrations*
