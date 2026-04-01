# Facebook Ads — Guide Complet Taillage Haielite
> Recherche consolidee — 31 mars 2026
> Page: Taillage Haielite (ID: 114640741561166) | App: AutoScale AI (1845382706193611)

---

## Table des matieres

1. [Vue d'ensemble & ROI](#1-vue-densemble--roi)
2. [Prerequis techniques](#2-prerequis-techniques)
3. [Structure API: Campaign > Ad Set > Ad](#3-structure-api)
4. [Ciblage geographique local](#4-ciblage-geographique-local)
5. [Types de campagnes & formats](#5-types-de-campagnes--formats)
6. [Lead Ads & formulaires](#6-lead-ads--formulaires)
7. [Meta Pixel & Conversions API (CAPI)](#7-meta-pixel--conversions-api)
8. [Audiences & retargeting](#8-audiences--retargeting)
9. [Budget & encheres](#9-budget--encheres)
10. [Saisonnalite Quebec](#10-saisonnalite-quebec)
11. [Copywriting & creatives](#11-copywriting--creatives)
12. [Integration technique (Next.js + Supabase)](#12-integration-technique)
13. [KPIs & metriques](#13-kpis--metriques)
14. [Erreurs courantes](#14-erreurs-courantes)
15. [Plan d'action](#15-plan-daction)

---

## 1. Vue d'ensemble & ROI

### Chiffres cles — Services locaux Canada/Quebec

| Metrique | Benchmark | Cible Haielite |
|----------|-----------|----------------|
| CPL (Cost Per Lead) | 30-50 CAD | < 30 CAD |
| CPC (Cost Per Click) | 0.50-2.00 CAD | < 1.50 CAD |
| CTR (Click Through Rate) | 0.9-1.6% | > 1.5% |
| CVR (Lead -> Client) | 8-15% | > 12% |
| ROAS | 2.5x-4.5x | > 3.0x |
| CPA (Cost Per Acquisition) | 30-100 CAD | < 75 CAD |

### Exemple calcul ROI

```
Budget mensuel:        1 500 CAD
CPL:                   45 CAD
Leads generes:         33 leads
Taux conversion:       12% (4 contrats)
Valeur contrat moyen:  800 CAD
Revenu genere:         3 200 CAD
ROI:                   113%
Break-even:            3-4 mois
```

### Facebook Ads vs Google Ads

| Critere | Facebook Ads | Google Ads |
|---------|-------------|------------|
| Intent client | Push (awareness) | Pull (recherche active) |
| CPC | 0.50-2.00 CAD | 1.50-5.00 CAD |
| CPL | 30-50 CAD | 50-100 CAD |
| Conversion rate | 8-15% | 12-20% |
| Meilleur pour | Awareness + retargeting | Leads chauds, urgents |
| Budget optimal | 500-1500 CAD/mois | 1000-3000 CAD/mois |

**Mix recommande:** 70% Facebook (awareness/volume) + 30% Google (conversion/intent)

---

## 2. Prerequis techniques

### Ce qu'on a deja
- Token Page Access (long-lived, permanent) avec scopes:
  `ads_management`, `ads_read`, `leads_retrieval`, `pages_read_engagement`, `pages_manage_ads`, `business_management`
- Page ID: `114640741561166`
- App ID: `1845382706193611`
- Secrets dans Infisical: `HAIELITE_META_*`

### Ce qu'il faut obtenir
1. **Ad Account ID** (`act_XXXXXXXXX`) — recupérer via API:
   ```bash
   curl "https://graph.facebook.com/v23.0/me/adaccounts?access_token=TOKEN"
   ```
2. **Meta Pixel ID** — creer ou recuperer:
   ```bash
   curl "https://graph.facebook.com/v23.0/114640741561166/pixels?access_token=TOKEN"
   ```
3. **Domaine verifie** — taillagehaielite.com dans Business Settings
4. **Meta Pixel Access Token** (System User) pour CAPI

---

## 3. Structure API

### Hierarchie des campagnes
```
Business Manager
  └─ Ad Account (act_XXXXXXXXX)
      └─ Campaign (objectif marketing)
          └─ Ad Set (audience, budget, planning)
              └─ Ad (creatif, lien, CTA)
```

### Endpoints principaux

**Creer une campagne:**
```bash
POST /act_{AD_ACCOUNT_ID}/campaigns
  name, objective (LEAD_GENERATION | CONVERSIONS | REACH), special_ad_categories
```

**Creer un ad set:**
```bash
POST /act_{AD_ACCOUNT_ID}/adsets
  campaign_id, name, daily_budget (centimes), targeting, start_time, end_time
```

**Creer une annonce:**
```bash
POST /act_{AD_ACCOUNT_ID}/ads
  adset_id, name, creative, status (PAUSED | ACTIVE)
```

### Rate limits
| Operation | Points | Limite Standard |
|-----------|--------|-----------------|
| GET | 1 pt | 9 000 pts/h |
| POST | 3 pts | |
| DELETE | 10 pts | |

Batch API disponible pour economiser les points (1 requete = N operations).

---

## 4. Ciblage geographique local

### Recuperer les codes geo
```bash
curl "https://graph.facebook.com/v23.0/search?type=adgeolocation&q=Vaudreuil&access_token=TOKEN"
```

### Exemple ciblage Vaudreuil-Soulanges + Rive-Sud
```json
{
  "geo_locations": {
    "cities": [
      {"key": "XXXX", "name": "Vaudreuil-Dorion", "region": "QC", "country": "CA"},
      {"key": "XXXX", "name": "Ile-Perrot"},
      {"key": "XXXX", "name": "Saint-Lazare"}
    ],
    "radius": 15,
    "distance_unit": "kilometer"
  },
  "age_min": 35,
  "age_max": 65,
  "flexible_spec": [{
    "interests": [{"name": "Home improvement"}],
    "behaviors": [{"name": "Property owners"}]
  }]
}
```

---

## 5. Types de campagnes & formats

### Campagnes par priorite

1. **Lead Generation** — Formulaire in-app, CPL ~27 CAD, 7.7% CVR
2. **Conversions** — Optimise sur actions site (Lead, Contact), ROAS 3-5x
3. **Traffic** — Dirige vers landing page optimisee
4. **Awareness** — Branding local, reach 10k-50k/mois

### Formats creatifs (par performance)

1. **Carousel** — 4-5 avant/apres + temoignages (meilleur CVR)
2. **Video/Reels** — Time-lapse 15-30s avant/apres (engagement 2-3x vs image)
3. **Image** — Avant/apres avec CTA clair (meilleur rapport cout/performance)
4. **Stories** — Urgence, offres limitees

### Advantage+ vs Manuel

| | Advantage+ | Manuel |
|--|-----------|--------|
| CPA | -9% vs baseline | Baseline |
| Controle | Faible (blackbox) | Total |
| Budget min | 2000+ CAD/mois | Tout budget |
| Recommande | Scaling | Testing initial |

**Approche hybride:** 70% manuel (testing) / 30% Advantage+ (scaling winners)

---

## 6. Lead Ads & formulaires

### Creer un formulaire Lead Ads
```bash
POST /v23.0/{page-id}/leadgen_forms
{
  "name": "Devis Gratuit Taillage",
  "questions": [
    {"type": "FULL_NAME", "key": "full_name"},
    {"type": "EMAIL", "key": "email"},
    {"type": "PHONE_NUMBER", "key": "phone_number"},
    {"type": "CUSTOM_TEXT_FIELD", "key": "type_haie",
     "label": "Type de haie", "options": ["Cedre","Feuillue","Autre"]},
    {"type": "CUSTOM_TEXT_FIELD", "key": "adresse", "label": "Adresse"},
    {"type": "CUSTOM_NUMBER_FIELD", "key": "longueur", "label": "Longueur (pi)"},
    {"type": "CUSTOM_NUMBER_FIELD", "key": "hauteur", "label": "Hauteur (pi)"}
  ]
}
```

### Recevoir les leads en temps reel (Webhook)

**1. Subscribe au webhook leadgen:**
```bash
POST /v23.0/{page-id}/subscribed_apps
  subscribed_fields: ["leadgen"]
```

**2. Challenge-response (GET):**
```typescript
// app/api/webhooks/facebook-leadgen/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.FB_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}
```

**3. Traiter les leads (POST):**
```typescript
export async function POST(request: Request) {
  const body = await request.json();
  // Verifier signature X-Hub-Signature-256
  for (const entry of body.entry) {
    for (const change of entry.changes) {
      if (change.field === 'leadgen') {
        await processLead(change.value.leadgen_id);
      }
    }
  }
  return new Response('ok', { status: 200 });
}

async function processLead(leadgenId: string) {
  // 1. Fetch lead data from Graph API
  const resp = await fetch(
    `https://graph.facebook.com/v23.0/${leadgenId}?fields=id,created_time,field_data,ad_id,form_id&access_token=${PAGE_TOKEN}`
  );
  const lead = await resp.json();

  // 2. Parse fields
  const parsed = parseFieldData(lead.field_data);

  // 3. Store in Supabase
  await supabase.from('facebook_leads').insert({
    leadgen_id: lead.id,
    form_id: lead.form_id,
    ad_id: lead.ad_id,
    field_data: lead.field_data,
    parsed_name: parsed.fullName,
    parsed_email: parsed.email,
    parsed_phone: parsed.phone,
  });

  // 4. SMS auto (2 min) + Email confirmation
  await sendSMS(parsed.phone, `Merci ${parsed.firstName}! Haie Lite vous rappelle dans 1h.`);
  await sendEmail(parsed.email, 'Votre demande de devis', emailTemplate(parsed));

  // 5. CAPI tracking
  await trackCAPIEvent('Lead', parsed);
}
```

### Instant Forms vs Messenger
**Instant Forms** — recommande pour services locaux:
- 40-50% meilleur taux conversion
- Donnees structurees (adresse, dimensions)
- Webhook temps reel -> SMS auto 2min = +35% taux reponse

### Timing follow-up optimal
| Delai | Action |
|-------|--------|
| 0 min | Email confirmation |
| 2 min | SMS initial |
| 1h | Appel commercial |
| 24h | Email relance |
| 7j | Notification agent (si inactif) |

---

## 7. Meta Pixel & Conversions API

### Installation Pixel — WordPress (taillagehaielite.com)
Plugin recommande: **Meta Pixel for WordPress** (officiel) ou **PixelYourSite Pro** (CAPI inclus)
1. Plugins > Add New > "Meta Pixel"
2. Settings > Meta Pixel > entrer Pixel ID
3. Activer Advanced Matching

### Installation Pixel — Next.js 15 (haie-lite-app.vercel.app)
```typescript
// app/layout.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <Script id="fb-pixel" strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){
            n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];
            t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', 'PIXEL_ID');
            fbq('track', 'PageView');
          `}} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Evenements a tracker

| Evenement | Quand | Code |
|-----------|-------|------|
| PageView | Chaque page | Automatique (Pixel base) |
| ViewContent | Page service | `fbq('track','ViewContent',{content_name:'Taille haies'})` |
| Lead | Formulaire devis | `fbq('track','Lead',{value:0,currency:'CAD'})` |
| Contact | Formulaire contact | `fbq('track','Contact')` |
| Schedule | RDV confirme | `fbq('track','Schedule')` |
| Purchase | Contrat signe | `fbq('track','Purchase',{value:1400,currency:'CAD'})` |

### Evenements custom
- `QuoteRequested` — Devis demande
- `BookAppointment` — RDV reserve
- `ContractSigned` — Contrat signe
- `AnnualRenewal` — Renouvellement
- `ServiceUpgrade` — Upgrade plan

### Conversions API (CAPI) — Server-side tracking
```typescript
// app/api/meta/track-event/route.ts
import crypto from 'crypto';

const PIXEL_ID = process.env.HAIELITE_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.HAIELITE_META_PAGE_ACCESS_TOKEN;

function hashSHA256(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export async function POST(request: Request) {
  const { event_name, event_id, user_data, custom_data } = await request.json();

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${PIXEL_ID}/events`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || crypto.randomUUID(),
          action_source: 'website',
          user_data: {
            em: hashSHA256(user_data.email),
            ph: hashSHA256(user_data.phone.replace(/\D/g, '')),
            fn: hashSHA256(user_data.first_name),
            client_ip_address: request.headers.get('x-forwarded-for'),
            client_user_agent: request.headers.get('user-agent'),
          },
          custom_data,
        }],
        access_token: ACCESS_TOKEN,
      }),
    }
  );
  return Response.json(await response.json());
}
```

### Deduplication Pixel + CAPI
Utiliser le **meme `event_id`** cote client ET serveur. Meta deduplique dans une fenetre de 48h.

```typescript
const eventId = crypto.randomUUID();
// Client: fbq('track', 'Lead', { event_id: eventId, ... });
// Server: POST /api/meta/track-event { event_id: eventId, ... }
```

### iOS 14+ / ATT
- 75-85% refusent le tracking → perte 25-50% signal
- **CAPI contourne** completement (serveur -> serveur)
- **AEM** (Aggregated Event Measurement) — Meta a supprime la limite de 8 events en 2025
- **First-party data** — collecter email/phone directement = meilleur matching

---

## 8. Audiences & retargeting

### Profil cible optimal

| Dimension | Critere |
|-----------|---------|
| Age | 35-65 ans |
| Revenu | 75 000+ CAD/an |
| Propriete | Proprietaires (x3 conversion vs locataires) |
| Interets | Home & garden, landscaping, outdoor living |
| Localisation | Rayon 5-15 km du siege |

### Types d'audiences

1. **Cold** — Interets + geo + demo (prospecting)
2. **Lookalike 1%** — Base sur clients existants satisfaits (+40-60% conversion)
3. **Retargeting** — Visiteurs site <14j (76% plus probable de convertir)
4. **Custom** — Email list clients existants (renouvellement annuel)

### Segmentation retargeting

| Segment | Comportement | Duree | Offre |
|---------|-------------|-------|-------|
| Visiteurs site | Tous | 14j | -15% premier service |
| Form abandoners | Debut formulaire | 7-10j | Offre urgente |
| Multi-visiteurs | 3+ visites | 30j | Social proof (avis) |

### Budget allocation
- 70% prospecting (cold + lookalike)
- 30% retargeting (visiteurs + abandons)

---

## 9. Budget & encheres

### Par taille d'entreprise

| Profil | Budget/mois | ROAS cible |
|--------|-------------|------------|
| Micro (<100k$/an) | 300-500 CAD | 2:1 |
| Petite (100-500k$/an) | 800-2 000 CAD | 3:1 |
| Medium (500k-2M$/an) | 2 000-5 000 CAD | 4:1 |

### Strategies d'encheres

1. **Spend-Based** (recommande debut) — Meta depense au plus bas possible
2. **Goal-Based** (scaling) — CPC/CPL cible, requiert 50+ conversions historiques
3. **CBO** (Campaign Budget Optimization) — Meta repartit entre ad sets, +15-25% perf

### CPM specifique Quebec
- Canada = 35% sous la moyenne mondiale
- Mais +122% de janvier a decembre (pic: novembre-decembre)
- **Meilleur CPM**: janvier-fevrier, juin-juillet

---

## 10. Saisonnalite Quebec

### Calendrier campagnes

| Campagne | Periode | Budget (% annuel) | Objectif |
|----------|---------|-------------------|----------|
| Pre-printemps | 22 avr - 31 mai | 30-35% | Awareness + lead gen intensive |
| Haute saison | 1-30 juin | 35-40% | Conversion directe, urgence |
| Maintien ete | 1 juil - 31 aout | 15-20% | Fill slots, 2e taille |
| Pre-automne | 1-30 sept | 5-10% | Derniere chance avant hiver |
| Basse saison | oct - mars | 5-10% | Brand building, deneigement |

### Cycle biologique haies Quebec
- **Debut juin** (S22-24): Premiere coupe (croissance max post-hiver)
- **Fin aout / debut sept** (S34-37): Deuxieme coupe (avant dormance)

### Budget annuel exemple (PME 1 550 CAD/an)
- Mai: 400 | Juin: 500 | Juil-Aout: 300 | Sept: 150 | Oct-Fev: 200

---

## 11. Copywriting & creatives

### Template 1: Urgence + Offre
```
Headline: "Vos haies sont entre les mains de pros"
Body:
Taillage de haies professionnel a [VILLE]
✓ Avant/apres garantis
✓ Equipe certifiee depuis 2008
✓ OFFRE SPECIALE: 20% rabais pour premiers 20 clients

CTA: "Demander un devis gratuit"
```

### Template 2: Before/After + Temoignage
```
Headline: "Vos haies meritent mieux"
Body:
De negligees a spectaculaires en 4 heures
Marie-Josee, Ile-Perrot: « Un changement INCROYABLE »

Taillage professionnel + nettoyage residus
→ Devis gratuit en 24h

Image: Time-lapse avant/apres
```

### Template 3: Douleur + Benefice
```
Headline: "Fatigue d'attendre?"
Body:
Vos haies poussent... et poussent... et poussent.
Nous on agit en 48h ✓

Taillage expert | Residus inclus | Resultats visibles immediatement

CTA: "Reserver maintenant"
```

### Template 4: Social Proof
```
Headline: "Pourquoi 2,847 proprietaires nous font confiance?"
Body:
⭐⭐⭐⭐⭐ 4.9/5 etoiles | 847 avis Google
Service disponible mai-septembre
OFFRE AVRIL: 15% rabais jusqu'au 30 avril

CTA: "Reserver votre spot"
```

### Script video 30s (Reels)
```
[0-3s]  Haies negligees → "Vous avez des haies qui ne demandent qu'une chose..."
[3-8s]  Equipe taille → "...une bonne taille!"
[8-15s] Time-lapse avant/apres → "En quelques heures, on transforme votre cour"
[15-20s] Proprio heureux → "Professionnel, rapide, abordable"
[20-30s] Logo + CTA → "Appelez maintenant! Devis gratuit"
```

### Best practices copy
- Lead avec benefice concret (avant/apres, temps, prix)
- CTA clair: "Devis gratuit", "Reserver maintenant"
- Tonalite: informelle, francais quebecois
- Social proof: avis, nombre clients, annees experience
- Offre limitee = urgence (date, nombre clients)
- A/B test: 3 versions headlines, 2 versions CTA, rotation 14j

---

## 12. Integration technique

### Architecture complete

```
Facebook Ads (Lead Gen Forms)
    │
    ├──→ Webhook POST /api/webhooks/facebook-leadgen
    │    ├── Challenge verification (GET)
    │    ├── Signature X-Hub-Signature-256 (POST)
    │    └── Fetch lead data from Graph API
    │
    ├──→ Supabase PostgreSQL
    │    ├── facebook_leads (leadgen_id, field_data, parsed_*, status)
    │    ├── webhook_events (logging, retries)
    │    └── crm_mappings (sync externe)
    │
    ├──→ Automations paralleles
    │    ├── SMS (Twilio/existing) — J+2min
    │    ├── Email (Resend) — immediat
    │    ├── CAPI tracking (Lead event)
    │    └── CRM sync
    │
    └──→ Monitoring
         ├── Polling cron 60s (fallback leads manques)
         ├── Retry logic 5min (webhook failures)
         └── Error alerts
```

### Schema Supabase
```sql
CREATE TABLE facebook_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leadgen_id VARCHAR UNIQUE NOT NULL,
  form_id VARCHAR NOT NULL,
  ad_id VARCHAR,
  field_data JSONB,
  parsed_name TEXT,
  parsed_email TEXT,
  parsed_phone TEXT,
  parsed_address TEXT,
  parsed_type_haie TEXT,
  processed BOOLEAN DEFAULT FALSE,
  follow_up_status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fb_leads_leadgen ON facebook_leads(leadgen_id);
CREATE INDEX idx_fb_leads_created ON facebook_leads(created_at DESC);
CREATE INDEX idx_fb_leads_status ON facebook_leads(follow_up_status);
```

### Webhook + Polling hybride
- **Webhook**: reception instantanee (0-2s latence)
- **Polling cron**: fallback toutes les 60s pour leads manques
- Rate limit: 200 req/h par token pour GET /leads

---

## 13. KPIs & metriques

### Dashboard de suivi

| Metrique | Benchmark | Bon | Excellent |
|----------|-----------|-----|-----------|
| CTR | 0.9-1.6% | 1.3%+ | 2%+ |
| CPL | 27-50 CAD | < 30 | < 22 |
| CVR | 7.7% | 8%+ | 12%+ |
| CPA | Variable | -9% vs baseline | -15%+ |
| ROAS | 3-5x | 3x | 5x+ |
| Frequency | 1-3 | < 4 | 2-3 |
| EMQ Score | 4-7 | 8+ | 9-10 |

### Impact des avis sur conversion
- Presence avis: +31% conversion
- 4.5+ etoiles: +25% vs 3.5
- Minimum 15-20 avis = credibilite
- Reponse aux avis: +18% conversion
- Photos avant/apres dans avis: +15-20%

**Prerequis:** minimum 20 avis Google avant scaling campagnes

---

## 14. Erreurs courantes

1. **Ciblage trop large** — gaspille budget sur non-qualifies
2. **Creative faible** — stock photos vs avant/apres reels (+40-60% perf)
3. **Pixel casse** — impossible d'optimiser sans tracking
4. **Modifications trop frequentes** — Meta a besoin de 7-10j pour optimiser
5. **Landing page lente** — form > 3 champs ou > 3s = drop-off 50%+
6. **Copy anglophone** — Quebec = francais, references locales
7. **Budget trop fragmente** — consolider 2-3 campagnes, 1000+ CAD/mois min
8. **Pas de rotation creative** — ad fatigue apres 3 semaines

---

## 15. Plan d'action

### Phase 1 — SETUP (Semaine 1)
- [ ] Obtenir Ad Account ID via API
- [ ] Creer/recuperer Meta Pixel ID
- [ ] Verifier domaine taillagehaielite.com dans Business Settings
- [ ] Installer Pixel sur WordPress (plugin officiel)
- [ ] Installer Pixel sur Next.js app (next/script)
- [ ] Stocker Pixel ID + CAPI token dans Infisical

### Phase 2 — PREMIERE CAMPAGNE (Semaine 2)
- [ ] Creer campagne Lead Generation "Taillage Printemps 2026"
- [ ] Ad set: Vaudreuil-Soulanges, 15km, proprio 35-65 ans
- [ ] Budget test: 10-15 CAD/jour
- [ ] 3 variations creative (carousel, image, video)
- [ ] Formulaire Lead Ads avec champs custom (type haie, adresse, dimensions)
- [ ] Activer + monitorer 10 jours

### Phase 3 — INTEGRATION BACKEND (Semaine 3)
- [ ] Webhook leadgen dans Next.js (/api/webhooks/facebook-leadgen)
- [ ] Table facebook_leads dans Supabase
- [ ] SMS auto 2min + email confirmation via Resend
- [ ] CAPI tracking server-side
- [ ] Polling cron fallback

### Phase 4 — OPTIMIZATION (Semaine 4+)
- [ ] Analyser CPL, CTR, CVR des 3 creatives
- [ ] Doubler budget sur winner
- [ ] Lancer retargeting (30% budget)
- [ ] Creer Lookalike 1% base clients existants
- [ ] Expansion geo (Rive-Sud, Rive-Nord)

### Phase 5 — SCALING (Mois 2+)
- [ ] Hybrid: 70% manuel + 30% Advantage+
- [ ] Budget: 1 500-2 000 CAD/mois haute saison
- [ ] Rotation creatives toutes 2 semaines
- [ ] A/B test permanent
- [ ] Target: CPL < 30, ROAS > 3x

---

## Secrets Infisical (prod)

```
HAIELITE_META_APP_ID          = 1845382706193611
HAIELITE_META_APP_SECRET       = d23d0013ce22acc34e0e8414cc48fd36
HAIELITE_META_PAGE_ID          = 114640741561166
HAIELITE_META_PAGE_ACCESS_TOKEN = EAAaOXaStZAMs... (permanent)
HAIELITE_FACEBOOK_EMAIL        = joannetteh1@hotmail.com
HAIELITE_FACEBOOK_PASSWORD     = Haielite12
# A AJOUTER:
# HAIELITE_META_AD_ACCOUNT_ID  = act_XXXXXXXXX
# HAIELITE_META_PIXEL_ID       = XXXXXXXXX
# HAIELITE_META_PIXEL_ACCESS_TOKEN = (System User token pour CAPI)
```

---

*Guide genere le 31 mars 2026 — 5 recherches paralleles consolidees*
*Page: Taillage Haielite | 1 332 followers | Token permanent | 7 scopes*
