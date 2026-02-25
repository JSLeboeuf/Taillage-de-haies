# Workflow d'Automatisation Complet — Haie Lite 2026

> De la pub Facebook au review Google : chaque etape automatisee

---

## ARCHITECTURE GLOBALE

```
                    ACQUISITION                          QUALIFICATION                      CONVERSION
              ┌──────────────────┐               ┌──────────────────────┐           ┌──────────────────────┐
              │  Facebook Ads    │               │                      │           │                      │
              │  Instagram Ads   │──Lead Form──→ │   API Route          │──────────→│  ServiceM8           │
              │  Google Ads      │               │   (webhook) + Supabase│           │  Job (Quote)         │
              │  Google LSA      │               │                      │           │                      │
              └──────────────────┘               └──────────┬───────────┘           └──────────┬───────────┘
                                                            │                                  │
              ┌──────────────────┐               ┌──────────▼───────────┐           ┌──────────▼───────────┐
              │  Appels entrants │               │                      │           │                      │
              │  (Twilio)        │──────────────→│   VAPI Receptionniste│           │  SMS Soumission      │
              │                  │               │   IA (24/7)          │──────────→│  + Follow-up auto    │
              └──────────────────┘               │                      │           │                      │
                                                 └──────────────────────┘           └──────────┬───────────┘
              ┌──────────────────┐                                                             │
              │  Site Web        │               ┌──────────────────────┐           ┌──────────▼───────────┐
              │  (Landing Page)  │──Formulaire──→│   GPT-4 Extraction   │           │  CLOSING             │
              │                  │               │   + Validation       │──────────→│  Quote → Work Order  │
              └──────────────────┘               └──────────────────────┘           │  → Completed         │
                                                                                    └──────────┬───────────┘
                                                                                               │
                                                                                    ┌──────────▼───────────┐
                                                                                    │  POST-JOB            │
                                                                                    │  Review + Referral   │
                                                                                    │  + Relance annuelle  │
                                                                                    └──────────────────────┘
```

---

## PHASE 1 : ACQUISITION DE LEADS

### 1A. Meta Ads (Facebook + Instagram)

**Config Lead Forms :**
```
Formulaire "Soumission Gratuite - Taille de Haie"
├── Prenom (pre-rempli Facebook)
├── Nom (pre-rempli)
├── Telephone (pre-rempli)
├── Email (pre-rempli)
├── Adresse complete (champ texte)
├── Type de haie (choix) :
│   ├── Cedre (thuya)
│   ├── Haie mixte
│   ├── Arbustes
│   └── Autre
├── Nombre de cotes a tailler (choix) :
│   ├── 1-2 cotes
│   ├── 3-4 cotes
│   ├── 5-6 cotes
│   └── Je ne sais pas
├── Hauteur approximative (choix) :
│   ├── Moins de 6 pieds
│   ├── 6-8 pieds
│   ├── 8-12 pieds
│   └── Plus de 12 pieds
└── Commentaire (optionnel)
```

**Webhook Meta → API Route :**
```
Meta Lead Form
    │
    ▼
API Route (POST /api/webhooks/meta-leads)
    │
    ├── 1. Sauvegarder lead dans Supabase (table: leads)
    │
    ├── 2. Enrichir donnees :
    │   ├── Geocoder adresse (Google Maps API)
    │   ├── Verifier zone de service (rayon 40km Vaudreuil-Dorion)
    │   └── Estimer prix GPT-4 (basé sur cotes + hauteur)
    │
    ├── 3. Creer dans ServiceM8 :
    │   ├── POST /company.json (si nouveau client)
    │   ├── POST /companycontact.json
    │   └── POST /job.json (status: Quote)
    │
    ├── 4. SMS immediat au lead (Twilio) :
    │   "Merci [Prenom]! Votre demande de soumission est bien recue.
    │    Estimation : [fourchette]$. On vous contacte sous 2h
    │    pour confirmer les details.
    │    - Haie Lite"
    │
    ├── 5. Notification Henri (SMS) :
    │   "Nouveau lead: [Nom] - [Ville]
    │    Haie cedre, [X] cotes, ~[Y]$
    │    Tel: [numero]"
    │
    └── 6. Si hors zone → SMS poli de refus :
        "Merci [Prenom]. Malheureusement, nous ne
         desservons pas encore votre secteur.
         On vous recommande [concurrent local]."
```

### 1B. Google Ads / LSA

**Lead Google LSA** : Appel direct → Route vers VAPI (section 2)

**Lead Google Search** : Landing page → Formulaire web
```
Landing Page haielite.com/soumission
    │
    ▼
POST /api/leads/web-form
    │
    ├── Meme pipeline que Meta (API webhook)
    ├── UTM tracking sauvegarde (source, campaign, keyword)
    └── Google Ads Conversion API callback
```

### 1C. Organique / Referral

```
Client existant refere un ami
    │
    ▼
Formulaire referral haielite.com/referral
    │
    ├── Info referee + info referrer
    ├── Creer lead avec source = "referral"
    ├── Appliquer 10% rabais automatique sur job
    ├── Crediter 50$ au referrer (futur service)
    └── SMS au referrer : "Merci! Votre ami [Prenom]
        nous a contacte. Vous recevrez 50$ de credit
        a votre prochain service."
```

---

## PHASE 2 : RECEPTIONNISTE IA (VAPI + TWILIO)

### Architecture Telephonie

```
Appel entrant (numero principal Haie Lite)
    │
    ├── Heures ouvrables (8h-18h lun-ven) :
    │   ├── Ring Henri 15 sec
    │   ├── Si pas de reponse → VAPI Agent IA
    │   └── Si occupe → VAPI Agent IA
    │
    └── Hors heures (soir + weekend) :
        └── VAPI Agent IA directement
```

### Prompt Systeme — Receptionniste IA

```
Tu es la receptionniste virtuelle de Haie Lite, une entreprise specialisee en taille
de haies de cedres au Quebec. Tu t'appelles Sophie.

PERSONNALITE :
- Chaleureuse, professionnelle, rassurante
- Accent neutre quebecois
- Tu vouvoies toujours le client
- Tu es directe et efficace (pas de bavardage inutile)

OBJECTIF PRINCIPAL :
Qualifier le lead et obtenir les informations necessaires pour creer une soumission.

INFORMATIONS A COLLECTER (dans l'ordre) :
1. Prenom et nom du client
2. Adresse complete du service (rue, ville, code postal)
3. Type de haie (cedre, mixte, arbustes)
4. Nombre de cotes a tailler (1 a 6+)
5. Hauteur approximative de la haie
6. Acces special? (cloture, terrain en pente, etc.)
7. Inclure le rabattage (haut)? Oui/Non
8. Inclure le ramassage des branches? Oui/Non
9. Date souhaitee ou urgence
10. Telephone et email pour la soumission

GRILLE DE PRIX (usage interne - NE JAMAIS citer de prix exact au telephone) :
- Dire : "Je peux vous donner une estimation approximative"
- 1-2 cotes : 250-400$
- 3-4 cotes : 400-600$
- 5-6 cotes : 600-900$
- Rabattage supplementaire : +150-300$
- Ramassage inclus dans tous nos prix
- Haies > 10 pieds : majoration 20-40%
- Taxes en sus (TPS 5% + TVQ 9.975%)

ESTIMATION :
Quand tu as le nombre de cotes et la hauteur, donne une FOURCHETTE :
"Pour [X] cotes de haie de cedre d'environ [Y] pieds de haut,
nos prix se situent generalement entre [min]$ et [max]$ avant taxes.
Le prix exact sera confirme dans votre soumission ecrite."

ZONE DE SERVICE :
- Vaudreuil-Dorion et environs (40km)
- Montreal (Ouest-de-l'Ile)
- Rive-Sud (Brossard, Saint-Constant, La Prairie, Candiac)
- Monteregie Ouest

Si hors zone : "Malheureusement nous ne desservons pas encore [ville].
Je peux noter votre nom au cas ou on etend notre territoire."

TRANSFERT :
- Si le client insiste pour parler a quelqu'un : "Je transfere votre appel a Henri,
  notre responsable. Si il n'est pas disponible, il vous rappellera dans l'heure."
- Questions techniques complexes : transferer a Henri

FIN D'APPEL :
"Parfait [Prenom]! Je vous envoie une soumission par texto dans les prochaines minutes.
Si vous avez des questions, n'hesitez pas a rappeler. Bonne journee!"

NE JAMAIS :
- Donner un prix fixe/exact
- Promettre une date precise sans verifier
- Parler de la competition
- Donner des conseils de taille DIY
- Mentionner que tu es une IA (sauf si demande directement, alors dire "Oui,
  je suis l'assistante virtuelle de Haie Lite. Voulez-vous parler a Henri?")
```

### VAPI Function Calling

```javascript
// Functions disponibles pour l'agent VAPI

const functions = [
  {
    name: "create_lead",
    description: "Cree un nouveau lead dans le systeme apres qualification",
    parameters: {
      first_name: { type: "string", required: true },
      last_name: { type: "string", required: true },
      phone: { type: "string", required: true },
      email: { type: "string" },
      address: { type: "string", required: true },
      city: { type: "string", required: true },
      hedge_type: { type: "string", enum: ["cedre", "mixte", "arbustes", "autre"] },
      sides_count: { type: "integer", min: 1, max: 8 },
      height_feet: { type: "number" },
      includes_top: { type: "boolean" },
      includes_cleanup: { type: "boolean", default: true },
      access_notes: { type: "string" },
      preferred_date: { type: "string" },
      estimated_min: { type: "number" },
      estimated_max: { type: "number" },
      source: { type: "string", default: "phone" }
    }
  },
  {
    name: "check_availability",
    description: "Verifie les disponibilites dans ServiceM8",
    parameters: {
      preferred_date: { type: "string" },
      city: { type: "string" }
    }
  },
  {
    name: "transfer_to_henri",
    description: "Transfere l'appel a Henri",
    parameters: {
      reason: { type: "string" }
    }
  }
];
```

### Webhook VAPI → Pipeline

```
VAPI appel termine
    │
    ▼
POST /api/webhooks/vapi-call-ended
    │
    ├── 1. Sauvegarder transcript dans Supabase
    │
    ├── 2. Si lead qualifie (create_lead appele) :
    │   ├── GPT-4 : extraire/valider donnees structurees du transcript
    │   ├── Geocoder adresse
    │   ├── POST ServiceM8 /company.json
    │   ├── POST ServiceM8 /companycontact.json
    │   ├── POST ServiceM8 /job.json (status: Quote, description: details haie)
    │   └── SMS soumission au client (voir Phase 3)
    │
    ├── 3. Si transfert Henri :
    │   ├── Log raison transfert
    │   └── Alerte si Henri n'a pas rappele dans 1h
    │
    └── 4. Si non qualifie (hors zone, pas interesse) :
        ├── Log raison
        └── Pas de follow-up
```

---

## PHASE 3 : SOUMISSION AUTOMATIQUE

### Calcul du Prix

```javascript
// /api/quotes/calculate.ts

interface QuoteInput {
  hedge_type: 'cedre' | 'mixte' | 'arbustes' | 'autre';
  sides_count: number;       // 1-8
  height_feet: number;       // hauteur en pieds
  includes_top: boolean;     // rabattage du dessus
  access_difficulty: 'easy' | 'moderate' | 'hard';
  city: string;
}

function calculateQuote(input: QuoteInput): { min: number; max: number; recommended: number } {
  // Prix de base par cote (donnees reelles ServiceM8 2024-2025)
  const BASE_PER_SIDE = {
    cedre: 130,      // ticket moyen 575$ / ~4.4 cotes moyen
    mixte: 110,
    arbustes: 90,
    autre: 120
  };

  let base = BASE_PER_SIDE[input.hedge_type] * input.sides_count;

  // Majoration hauteur
  if (input.height_feet > 10) base *= 1.35;
  else if (input.height_feet > 8) base *= 1.20;
  else if (input.height_feet > 6) base *= 1.10;

  // Rabattage (top)
  if (input.includes_top) base += 150;

  // Difficulte d'acces
  const accessMultiplier = {
    easy: 1.0,
    moderate: 1.15,
    hard: 1.30
  };
  base *= accessMultiplier[input.access_difficulty];

  // Distance (Montreal vs banlieue)
  const MONTREAL_PREMIUM_CITIES = ['Montreal', 'Montréal', 'Westmount'];
  if (MONTREAL_PREMIUM_CITIES.includes(input.city)) base *= 1.10;

  // Fourchette
  const min = Math.round(base * 0.85);
  const max = Math.round(base * 1.15);
  const recommended = Math.round(base);

  // Plancher minimum
  return {
    min: Math.max(min, 200),
    max: Math.max(max, 300),
    recommended: Math.max(recommended, 250)
  };
}
```

### SMS Soumission

```
Declencheur : Job cree dans ServiceM8 (status: Quote)
Delai : Immediat (< 5 min apres appel/formulaire)

───────────────────────────────────
Bonjour [Prenom]!

Voici votre soumission Haie Lite :

Taille de haie de cedre
[X] cotes + dessus
Ramassage inclus

Estimation : [min]$ - [max]$ + taxes

Pour confirmer votre rendez-vous,
repondez OUI a ce message.

Questions? Appelez-nous au
[numero principal].

haielite.com
───────────────────────────────────
```

### Reponse Client → Booking Automatique

```
Client repond "OUI" par SMS
    │
    ▼
Twilio Webhook → /api/webhooks/sms-reply
    │
    ├── 1. Matcher SMS au lead (par numero telephone)
    │
    ├── 2. ServiceM8 : changer job status Quote → Work Order
    │
    ├── 3. Trouver prochaine disponibilite :
    │   ├── Query /jobactivity.json pour la semaine
    │   ├── Identifier slots libres
    │   └── Proposer date au client
    │
    ├── 4. SMS confirmation :
    │   "Parfait [Prenom]! Votre taille de haie est
    │    reservee pour le [date] entre [plage horaire].
    │    Notre equipe sera la. Pas besoin d'etre present,
    │    assurez-vous juste que l'acces est libre.
    │    A bientot! - Haie Lite"
    │
    ├── 5. Creer JobActivity dans ServiceM8 (booking)
    │
    └── 6. Ajouter au calendrier de la queue mensuelle
         (ServiceM8 job queue: mars/avril/mai/etc.)
```

---

## PHASE 4 : RELANCE AUTOMATISEE (Leads non-convertis)

### Sequence de Relance

```
JOUR 0 : Lead recoit soumission (SMS)
    │
    ▼
JOUR 1 : Pas de reponse
    │ SMS Relance #1 (10h00)
    │ "Bonjour [Prenom]! Avez-vous eu le temps de
    │  regarder notre soumission pour votre taille
    │  de haie? Repondez OUI pour reserver.
    │  Questions? On est la!"
    │
    ▼
JOUR 3 : Toujours pas de reponse
    │ SMS Relance #2 (14h00)
    │ "Bonjour [Prenom], petit rappel pour votre
    │  soumission de taille de haie ([min]-[max]$).
    │  Les creneaux se remplissent vite en [mois].
    │  Repondez OUI ou appelez-nous!"
    │
    ▼
JOUR 7 : Toujours pas de reponse
    │ Email Relance #3 (contenu riche)
    │ Objet: "Votre soumission Haie Lite - [Prenom]"
    │ Corps:
    │ - Rappel soumission
    │ - 2-3 photos avant/apres
    │ - Temoignage client
    │ - Bouton "Confirmer mon rendez-vous"
    │ - Lien reviews Google
    │
    ▼
JOUR 14 : Toujours pas de reponse
    │ SMS Relance #4 (derniere)
    │ "Bonjour [Prenom], c'est notre dernier rappel
    │  pour votre soumission taille de haie.
    │  Si vous changez d'avis, notre numero : [tel].
    │  Bonne saison! - Haie Lite"
    │
    ▼
JOUR 14+ : Marquer "Unsuccessful" dans ServiceM8
    │ Lead passe en base dormante
    │ Sera relance a la prochaine saison (voir Phase 7)
```

### Implementation (API Routes + Vercel Cron)

```
Vercel Cron Job: "Lead Follow-up Sequence"
Config: vercel.json → cron toutes les heures (09h-18h)

API Route: /api/cron/lead-followup
Method: GET (protege par CRON_SECRET header)

1. Query Supabase :
   SELECT * FROM leads
   WHERE status = 'quote_sent'
   AND response IS NULL
   AND created_at < NOW() - INTERVAL '[X] days'
   AND follow_up_count < 4

2. Pour chaque lead :
   ├── Jour 1 → SMS relance #1 via Twilio
   ├── Jour 3 → SMS relance #2 via Twilio
   ├── Jour 7 → Email relance #3 via Resend
   └── Jour 14 → SMS relance #4 via Twilio + marquer unsuccessful

3. Update Supabase :
   follow_up_count++
   last_follow_up_at = NOW()

4. Si client repond "OUI" a n'importe quel moment :
   → Pipeline booking (Phase 3)
   → Arreter la sequence

5. Si client repond "NON" ou "STOP" :
   → Marquer unsuccessful
   → Arreter la sequence
   → Respecter opt-out (CRTC/LCAP compliance)
```

### Stop Words (Compliance)

```javascript
const STOP_WORDS = ['stop', 'arret', 'arreter', 'desabonner', 'non merci', 'pas interesse'];
const OPT_OUT_RESPONSE = "Vous etes desabonne. Aucun autre message ne sera envoye. " +
                         "Appelez [numero] si vous changez d'avis.";

// Verifier chaque reponse SMS entrante
function checkOptOut(message: string): boolean {
  return STOP_WORDS.some(word => message.toLowerCase().includes(word));
}
```

---

## PHASE 5 : JOUR DU SERVICE

### J-1 : Confirmation Automatique

```
Trigger : Cron 18h00 chaque jour
Action  : Envoyer SMS aux clients du lendemain

"Bonjour [Prenom]!

Rappel : votre taille de haie est prevue
demain [Date] entre [Heure].

Notre equipe sera sur place. Pas besoin
d'etre present, assurez-vous juste que
l'acces aux haies est libre.

Repondez REPORTER si vous devez changer.

- Haie Lite"

Implementation :
1. Query ServiceM8 /jobactivity.json
   $filter=start_date gt '[demain 00:00]' and start_date lt '[demain 23:59]'
2. Pour chaque booking, recuperer company + contact
3. Envoyer SMS via Twilio
4. Si reponse "REPORTER" → notifier Henri + flag dans ServiceM8
```

### Jour J : Notifications Equipe

```
Trigger : Cron 6h30 chaque jour

SMS au chef d'equipe :
"Bonjour! Aujourd'hui [X] jobs :

1. [Nom] - [Adresse] - [Heure]
   Haie cedre [X] cotes
2. [Nom] - [Adresse] - [Heure]
   [description]
...

Route optimisee : [lien Google Maps multi-stop]
Bonne journee!"
```

---

## PHASE 6 : POST-SERVICE

### 6A. Demande de Review (2h apres completion)

```
Trigger : ServiceM8 webhook "job.completed"
Delai   : 2 heures apres completion

SMS :
"Merci [Prenom]! Votre taille de haie est
completee.

Satisfait du resultat?

30 secondes pour nous laisser un avis Google :
[lien court Google Reviews]

Votre avis nous aide enormement!

- Haie Lite"

Si pas de review apres 3 jours :
Email rappel avec photos avant/apres du job
+ lien direct Google Reviews
```

### 6B. Programme Referral (J+7)

```
Trigger : 7 jours apres job complete
Condition : Client satisfait (pas de plainte)

SMS :
"Bonjour [Prenom]!

Connaissez-vous quelqu'un qui a besoin
d'un taillage de haie?

Referez un ami et recevez 50$ de credit
sur votre prochain service!

Votre lien personnel :
haielite.com/ref/[code-unique]

- Haie Lite"

Tracking :
- Chaque referral code est unique par client
- Quand un referee utilise le lien → credit 50$ au referrer
- Referee recoit 10% de rabais automatique
- Suivi dans Supabase (table: referrals)
```

### 6C. Facture & Paiement

```
Trigger : Job marque "Completed" dans ServiceM8
Action  : Generer et envoyer facture

ServiceM8 invoice auto :
1. Montant du job + taxes (TPS 5% + TVQ 9.975%)
2. Envoi par email via ServiceM8
3. Options paiement :
   ├── Virement Interac (info dans email)
   ├── Carte de credit (Stripe link)
   └── Cash/cheque (sur place)

Si impaye apres 30 jours → Sequence rappel paiement :
   Jour 30 : Email doux
   Jour 45 : SMS + Email
   Jour 60 : Appel Henri
   Jour 90 : Mise en collection
```

---

## PHASE 7 : RELANCE SAISONNIERE (Clients Existants)

### Campagne Pre-Saison (Fevrier-Mars)

```
Trigger : 1er fevrier, cron annuel
Audience : Tous les clients avec job "Completed" l'annee precedente

Sequence :

FEVRIER SEMAINE 1 — Email :
Objet: "[Prenom], c'est bientot la saison de taille!"
Corps:
- "La saison 2026 approche"
- "Reservez tot et economisez 10%"
- "Creneaux limites en avril-mai"
- Bouton "Reserver maintenant"

FEVRIER SEMAINE 3 — SMS :
"Bonjour [Prenom]! La saison de taille approche.
Reservez avant le [date] et obtenez 10% de rabais.
Repondez OUI pour reserver au meme prix que l'an dernier.
- Haie Lite"

MARS SEMAINE 1 — SMS (si pas repondu) :
"Dernier rappel [Prenom]! Les creneaux d'avril
se remplissent. Votre haie a [adresse] est due
pour sa taille annuelle. Repondez OUI!
- Haie Lite"
```

### Reactivation Dormants (12+ mois sans service)

```
Trigger : Mensuel (1er du mois, mars-juin)
Audience : Clients avec dernier job > 12 mois

SMS :
"Bonjour [Prenom]! Ca fait un moment
qu'on n'a pas taille votre haie a [ville].

Offre speciale retour : 15% de rabais
sur votre prochain service.

Repondez OUI ou appelez [numero].
Offre valide 30 jours.

- Haie Lite"

Note: 1,082 clients dormants identifies dans ServiceM8
Valeur potentielle : 1,082 x 575$ x 15% reactivation = ~93,000$
```

---

## TABLES SUPABASE

### Schema Complet

```sql
-- Leads entrants (toutes sources)
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL CHECK (source IN (
    'meta_lead_form', 'google_lsa', 'google_search',
    'website_form', 'phone_vapi', 'referral', 'seasonal_relance'
  )),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
    'new', 'qualified', 'quote_sent', 'follow_up',
    'booked', 'completed', 'unsuccessful', 'opted_out'
  )),

  -- Contact
  first_name TEXT NOT NULL,
  last_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address_full TEXT,
  address_city TEXT,
  address_postal_code TEXT,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  in_service_zone BOOLEAN DEFAULT TRUE,

  -- Job details
  hedge_type TEXT,
  sides_count INTEGER,
  height_feet DECIMAL(4,1),
  includes_top BOOLEAN DEFAULT FALSE,
  includes_cleanup BOOLEAN DEFAULT TRUE,
  access_notes TEXT,
  preferred_date DATE,

  -- Pricing
  estimated_min DECIMAL(10,2),
  estimated_max DECIMAL(10,2),
  estimated_recommended DECIMAL(10,2),
  final_price DECIMAL(10,2),

  -- ServiceM8 IDs
  servicem8_company_uuid TEXT,
  servicem8_job_uuid TEXT,

  -- Follow-up tracking
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  next_follow_up_at TIMESTAMPTZ,

  -- Attribution
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  meta_ad_id TEXT,
  google_click_id TEXT,
  referral_code TEXT,

  -- VAPI
  vapi_call_id TEXT,
  vapi_transcript TEXT,
  vapi_duration_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  qualified_at TIMESTAMPTZ,
  quote_sent_at TIMESTAMPTZ,
  booked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_next_followup ON leads(next_follow_up_at)
  WHERE status IN ('quote_sent', 'follow_up');

-- Programme referral
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_lead_id UUID REFERENCES leads(id),
  referrer_phone TEXT NOT NULL,
  referrer_code TEXT UNIQUE NOT NULL,
  referee_lead_id UUID REFERENCES leads(id),
  credit_amount DECIMAL(10,2) DEFAULT 50.00,
  credit_used BOOLEAN DEFAULT FALSE,
  discount_percent INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages envoyes (audit trail)
CREATE TABLE messages_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'email', 'phone')),
  template TEXT NOT NULL,
  content TEXT,
  direction TEXT CHECK (direction IN ('outbound', 'inbound')),
  status TEXT DEFAULT 'sent',
  twilio_sid TEXT,
  resend_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_lead ON messages_sent(lead_id);

-- KPIs journaliers
CREATE TABLE daily_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  leads_total INTEGER DEFAULT 0,
  leads_meta INTEGER DEFAULT 0,
  leads_google INTEGER DEFAULT 0,
  leads_phone INTEGER DEFAULT 0,
  leads_referral INTEGER DEFAULT 0,
  leads_qualified INTEGER DEFAULT 0,
  quotes_sent INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  ad_spend_meta DECIMAL(10,2) DEFAULT 0,
  ad_spend_google DECIMAL(10,2) DEFAULT 0,
  cpl DECIMAL(10,2),
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## STACK TECHNIQUE & COUTS

### Services Requis

| Service | Role | Cout/mois | Deja en Infisical? |
|---------|------|-----------|---------------------|
| **ServiceM8** | CRM/Dispatch | ~129$ | OUI (API Key) |
| **VAPI** | Agent IA voix | ~100$ (2000 min) | OUI |
| **Twilio** | SMS + telephonie | ~80$ | OUI |
| **Supabase** | Database + auth | 25$ | OUI |
| **Resend** | Emails transactionnels | 20$ | OUI |
| **Vercel** | Hosting + cron + API | 20$ (Pro) | OUI |
| **OpenAI** (GPT-4) | Extraction + calcul prix | ~30$ | OUI |
| **Google Maps API** | Geocoding | ~10$ | A AJOUTER |
| **Stripe** | Paiements en ligne | 2.9% + 0.30$ | OUI |
| **TOTAL** | | **~415$/mois** | |

### Ce Qui Est Deja Configure (Infisical)

```
Credentials existants et prets a utiliser :
├── SERVICEM8_API_KEY          ✅
├── TWILIO_ACCOUNT_SID         ✅
├── TWILIO_AUTH_TOKEN           ✅
├── VAPI_API_KEY                ✅
├── SUPABASE_URL                ✅
├── SUPABASE_SERVICE_KEY        ✅
├── RESEND_API_KEY              ✅
├── OPENAI_API_KEY              ✅
├── STRIPE_SECRET_KEY           ✅

A ajouter :
├── GOOGLE_MAPS_API_KEY         ❌
├── META_ACCESS_TOKEN           ❌ (pour Conversions API)
├── META_PIXEL_ID               ❌
├── GOOGLE_ADS_CONVERSION_ID    ❌
└── CRON_SECRET                 ❌ (pour proteger les cron jobs Vercel)
```

---

## WORKFLOWS (API Routes + Vercel Cron)

### Vue d'ensemble des API Routes et Cron Jobs

```
API Routes (webhooks entrants) :

1. /api/webhooks/meta-leads
   Trigger: Webhook Meta Lead Form
   → Enrichir → ServiceM8 → SMS soumission → Notif Henri

2. /api/webhooks/google-leads
   Trigger: Webhook Google Ads / LSA
   → Meme pipeline que #1

3. /api/webhooks/web-form
   Trigger: Formulaire site web
   → Meme pipeline que #1

4. /api/webhooks/vapi-call-ended
   Trigger: Webhook VAPI
   → Extraire donnees → ServiceM8 → SMS soumission

5. /api/webhooks/sms-reply
   Trigger: Webhook Twilio (SMS entrant)
   → Router: OUI → booking | NON → stop | REPORTER → reschedule

8. /api/webhooks/servicem8-job-completed
   Trigger: Webhook ServiceM8 job.completed
   → Delai 2h → SMS demande review Google


Vercel Cron Jobs (automatisations temporelles) :

6. /api/cron/lead-followup
   Schedule: 0 9-18 * * * (toutes les heures 9h-18h)
   → Query leads non-repondus → Envoyer relance appropriee

7. /api/cron/pre-service-confirmation
   Schedule: 0 18 * * * (18h00 quotidien)
   → Jobs du lendemain → SMS confirmation clients

9. /api/cron/referral-trigger
   Schedule: 0 10 * * * (10h00 quotidien)
   → Jobs completés il y a 7 jours → SMS referral avec code unique

10. /api/cron/seasonal-relance
    Schedule: 0 9 * * 1 (lundis 9h, fevrier-mars)
    → Clients annee precedente → Sequence pre-saison

11. /api/cron/dormant-reactivation
    Schedule: 0 9 1 3-6 * (1er du mois, mars-juin, 9h)
    → Clients > 12 mois → Offre 15% rabais

12. /api/cron/payment-reminders
    Schedule: 0 9 * * * (9h quotidien)
    → Factures impayees > 30 jours → Sequence rappel

13. /api/cron/daily-kpi-report
    Schedule: 0 7 * * * (7h00 quotidien)
    → Agreger metriques → Email/SMS Henri + Jean-Samuel

14. /api/cron/weather-alert
    Schedule: 0 6 * * * (6h00 quotidien)
    → API meteo → Si pluie > 70% → Alerte equipes


Config vercel.json :
{
  "crons": [
    { "path": "/api/cron/lead-followup", "schedule": "0 9-18 * * *" },
    { "path": "/api/cron/pre-service-confirmation", "schedule": "0 18 * * *" },
    { "path": "/api/cron/referral-trigger", "schedule": "0 10 * * *" },
    { "path": "/api/cron/seasonal-relance", "schedule": "0 9 * * 1" },
    { "path": "/api/cron/dormant-reactivation", "schedule": "0 9 1 3-6 *" },
    { "path": "/api/cron/payment-reminders", "schedule": "0 9 * * *" },
    { "path": "/api/cron/daily-kpi-report", "schedule": "0 7 * * *" },
    { "path": "/api/cron/weather-alert", "schedule": "0 6 * * *" }
  ]
}
```

---

## METRIQUES & DASHBOARD

### KPIs Temps Reel (Supabase + Vercel Dashboard)

```
ACQUISITION
├── Leads aujourd'hui : [X]
├── CPL moyen 7 jours : [X]$
├── Source #1 : Meta ([X]%)
└── Budget restant mois : [X]$

CONVERSION
├── Taux qualification : [X]%
├── Taux quote→booking : [X]%
├── Delai moyen reponse : [X]h
└── Leads en attente : [X]

OPERATIONS
├── Jobs aujourd'hui : [X]
├── Revenus aujourd'hui : [X]$
├── Equipes actives : [X]/[X]
└── Completion rate : [X]%

RETENTION
├── Reviews ce mois : [X] (avg [X]★)
├── Referrals ce mois : [X]
├── Clients reactives : [X]
└── Taux reactivation : [X]%
```

### Alertes Automatiques

```javascript
// Alertes critiques envoyees par SMS a Henri + Jean-Samuel

const ALERTS = {
  // Lead pas traite depuis 2h
  lead_stale: {
    condition: 'lead.status = "new" AND age > 2h',
    message: '🚨 Lead non-traité depuis 2h : [Nom] - [Ville]',
    to: ['henri']
  },

  // CPL depasse seuil
  cpl_high: {
    condition: 'daily_cpl > 60',
    message: '⚠️ CPL aujourd\'hui : [X]$ (seuil: 60$). Verifier ads.',
    to: ['jean-samuel']
  },

  // Taux conversion en baisse
  conversion_drop: {
    condition: 'weekly_conversion < 25%',
    message: '⚠️ Conversion cette semaine : [X]% (cible: 34%)',
    to: ['henri', 'jean-samuel']
  },

  // Review negative
  bad_review: {
    condition: 'review.rating < 4',
    message: '🚨 Review [X]★ de [Client]. Repondre dans 4h!',
    to: ['henri']
  },

  // Pipeline vide (pas de leads depuis 24h)
  pipeline_dry: {
    condition: 'leads_last_24h = 0 AND is_weekday',
    message: '⚠️ Aucun lead depuis 24h. Verifier ads + site.',
    to: ['jean-samuel']
  }
};
```

---

## DEPLOIEMENT PAR PHASES

### Phase 1 — Fondations (Semaine 1-2)

```
PRIORITE ABSOLUE : avoir des leads qui rentrent et se convertissent

□ Creer tables Supabase (schema ci-dessus)
□ Configurer vercel.json avec cron jobs
□ API Route #1 : /api/webhooks/meta-leads → ServiceM8 → SMS
□ API Route #5 : /api/webhooks/sms-reply (OUI/NON/REPORTER)
□ Cron Job #6 : /api/cron/lead-followup (4 relances)
□ Configurer VAPI receptionniste (prompt ci-dessus)
□ API Route #4 : /api/webhooks/vapi-call-ended → ServiceM8 pipeline
□ Landing page haielite.com/soumission
□ Lancer premieres Facebook Ads (500$ test)

Resultat : Leads arrivent, sont qualifies, recoivent soumission,
et sont relances automatiquement.
```

### Phase 2 — Optimisation (Semaine 3-4)

```
□ Google Ads (Search + LSA)
□ API Route #3 : /api/webhooks/web-form
□ Cron Job #7 : /api/cron/pre-service-confirmation
□ API Route #8 : /api/webhooks/servicem8-job-completed
□ Cron Job #13 : /api/cron/daily-kpi-report
□ Dashboard metriques Supabase
□ Ajuster pricing algorithm avec donnees reelles
□ A/B test SMS vs email pour soumissions

Resultat : Multi-canal, operations fluides, mesure precis du ROI.
```

### Phase 3 — Croissance (Mois 2-3)

```
□ Cron Job #9 : /api/cron/referral-trigger
□ Cron Job #10 : /api/cron/seasonal-relance
□ Cron Job #11 : /api/cron/dormant-reactivation
□ Cron Job #12 : /api/cron/payment-reminders
□ Cron Job #14 : /api/cron/weather-alert
□ Google Ads Performance Max
□ Retargeting Meta (audiences chaudes)
□ Stripe payment links dans les factures
□ Meta Conversions API (attribution)

Resultat : Machine complete. Acquisition, conversion, retention,
tout tourne en automatique.
```

---

## ROI PROJETE

```
SANS AUTOMATISATION (baseline Henri solo) :
├── Leads/mois : ~20 (bouche-a-oreille)
├── Conversion : ~67% (donnees ServiceM8 reelles)
├── Clients/mois : ~13
├── CA mensuel : ~7,500$ (ticket 575$)
├── CA annuel : ~133k$ (2025 reel)
└── Cout marketing : ~0$

AVEC AUTOMATISATION COMPLETE :
├── Leads/mois : 60-80 (Ads + organique + referral)
├── Conversion : 34% (funnel standard avec volume)
├── Clients/mois : 20-27
├── CA mensuel peak : 15,500$ (1 crew)
├── CA annuel 1 crew : ~200k$
├── Cout marketing : ~4,000$/mois
├── Cout automatisation : ~415$/mois
└── ROI marketing : 2.5-3x

SCALING A 2M$ (5 crews) :
├── Leads/mois : 350-450
├── Conversion : 30-34%
├── Clients/mois : 105-153
├── Budget ads : ~15,000$/mois
├── Cout automatisation : ~600$/mois
├── CA annuel : 2,000k$
└── EBITDA : ~200k$ (10%)
```

---

*Compile le 20 fevrier 2026*
*Source: Donnees reelles ServiceM8 (447 jobs, 132k$ CA 2025), benchmarks Meta/Google Ads 2026, architecture Vercel/Supabase existante*
