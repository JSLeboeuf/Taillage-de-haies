# Tracking Temps, Masse Salariale & Incentives Employes

> Remplacer le calpin par un systeme automatise qui paie au merite

---

## PROBLEME ACTUEL

```
Calpin dans le truck
    │
    ├── Henri ecrit les heures a la main
    ├── Erreurs frequentes (oublis, arrondis)
    ├── Aucune visibilite temps reel sur les couts
    ├── Paie calculee a la fin de la semaine/mois
    ├── Impossible de savoir si un job est rentable
    └── Zero incentive a performer
```

---

## SOLUTION : SERVICEM8 COMME TIME TRACKER

ServiceM8 a DEJA le tracking de temps integre. Chaque job a des `JobActivity` avec `start_date` et `end_date` par employe (`staff_uuid`). On n'a pas besoin d'une autre app.

### Flow Terrain (Employes)

```
Employe arrive sur le chantier
    │
    ▼
ServiceM8 App (deja installee sur les telephones)
    │
    ├── 1. "Start Job" → enregistre heure debut
    │      (geolocalisation auto = preuve de presence)
    │
    ├── 2. Travail en cours
    │      (photos avant/apres obligatoires)
    │
    ├── 3. "Complete Job" → enregistre heure fin
    │      (geolocalisation fin = preuve)
    │
    └── 4. Systeme calcule automatiquement :
           ├── Duree du job (ex: 1h45)
           ├── Temps de deplacement (entre jobs)
           └── Heures totales de la journee
```

### Donnees Deja Disponibles dans l'API ServiceM8

```
GET /api_1.0/jobactivity.json?$filter=start_date gt '2026-03-15'

Response :
{
  "uuid": "abc-123",
  "job_uuid": "job-456",
  "staff_uuid": "staff-789",       ← qui
  "start_date": "2026-03-15 08:15:00",  ← debut
  "end_date": "2026-03-15 09:45:00",    ← fin
  "activity_was_scheduled": "1"
}

+ GET /api_1.0/staff.json → noms, taux horaires
+ GET /api_1.0/job.json/{uuid} → montant du job, client
```

---

## MASSE SALARIALE EN TEMPS REEL

### Rapport Automatique Quotidien (Cron 17h30)

```
API Route : /api/cron/daily-payroll

1. Pull toutes les JobActivity du jour (ServiceM8)
2. Grouper par staff_uuid
3. Calculer heures totales par employe
4. Multiplier par taux horaire
5. Comparer aux revenus du jour
6. SMS a Henri + Jean-Samuel
```

### Format du Rapport

```
SMS a Henri (17h30) :

MASSE SALARIALE — 15 mars 2026

EQUIPE 1 (Truck Nord)
├── Miguel    : 8.5h × 18$/h = 153$
├── Carlos    : 8.5h × 18$/h = 153$
└── Chef Marc : 8.5h × 28$/h = 238$
Sous-total : 544$

EQUIPE 2 (Truck Sud)
├── Pedro     : 8.0h × 18$/h = 144$
├── Jose      : 7.5h × 18$/h = 135$
└── Chef Henri: 8.0h × 28$/h = 224$
Sous-total : 503$

TOTAL JOUR : 1,047$
REVENUS JOUR : 3,450$ (6 jobs)
MARGE BRUTE : 2,403$ (70%)

Ratio salaires/revenus : 30% ✓ (cible: <45%)
```

### Dashboard Hebdo (Dimanche 20h)

```
MASSE SALARIALE — Semaine 12

                 Lun   Mar   Mer   Jeu   Ven   TOTAL
Miguel          8.5h  8.0h  8.5h  8.0h  8.5h  41.5h  = 747$
Carlos          8.5h  8.0h  8.5h  7.5h  8.5h  41.0h  = 738$
Pedro           8.0h  8.0h  7.5h  8.0h  8.0h  39.5h  = 711$
Jose            7.5h  7.0h  8.0h  7.5h  7.0h  37.0h  = 666$
Chef Marc       8.5h  8.0h  8.5h  8.0h  8.5h  41.5h  = 1,162$
Chef Henri      8.0h  8.0h  8.0h  8.0h  8.0h  40.0h  = 1,120$

TOTAL SEMAINE : 5,144$
REVENUS SEMAINE : 17,250$ (32 jobs)
MARGE BRUTE : 12,106$ (70%)

→ Export CSV pour Employeur D : [lien]
```

### Export Employeur D

```typescript
// /api/payroll/export-employeur-d.ts
// Genere un CSV compatible Employeur D chaque dimanche

interface PayrollExport {
  employee_id: string;      // ID Employeur D
  period_start: string;     // lundi
  period_end: string;       // vendredi
  regular_hours: number;    // max 40h
  overtime_hours: number;   // > 40h (1.5x)
  total_gross: number;
  bonus: number;            // incentives du mois
}

// CSV format Employeur D :
// employee_id,period,regular_hours,overtime_hours,bonus
// EMP001,2026-03-15,40.0,1.5,50.00
// EMP002,2026-03-15,39.5,0,25.00
```

---

## SYSTEME D'INCENTIVES

### Vue d'ensemble

```
4 sources de bonus pour les employes :

1. REVIEW BONUS       → 25$ par review 5 etoiles Google
2. REFERRAL COMMISSION → 50$ par client refere qui booke
3. PERFORMANCE BONUS   → Mensuel base sur score global
4. COMMISSION UPSELL   → 10-50$ par service additionnel vendu

Paiement : ajout au prochain cheque de paie via Employeur D
Tracking : Supabase (table: employee_incentives)
```

### 1. Review Bonus (25$ par 5 etoiles)

```
FLOW :

Job complete dans ServiceM8
    │
    ▼ (+2h)
SMS automatique au client :
"Merci! Laissez-nous un avis Google : [lien]"
    │
    ▼
Client laisse un review Google
    │
    ▼
Cron quotidien : /api/cron/check-google-reviews
    │
    ├── 1. Pull nouveaux reviews Google (Google Business Profile API)
    │
    ├── 2. Matcher review au job :
    │      ├── Par nom du client (fuzzy match)
    │      ├── Par date (review dans les 7 jours du job)
    │      └── Par adresse/ville si disponible
    │
    ├── 3. Identifier l'equipe qui a fait le job :
    │      ├── job_uuid → jobactivity → staff_uuid(s)
    │      └── Tous les membres de l'equipe recoivent le bonus
    │
    ├── 4. Si review = 5 etoiles :
    │      ├── Crediter 25$ a CHAQUE membre de l'equipe
    │      ├── Sauvegarder dans Supabase (employee_incentives)
    │      └── Notification SMS a l'equipe :
    │          "Bravo! [Client] vous a donne 5 etoiles!
    │           +25$ bonus sur votre prochain cheque."
    │
    └── 5. Si review < 4 etoiles :
           ├── Alerte Henri immediatement
           ├── Pas de bonus
           └── Coaching opportunity
```

**Pourquoi ca marche :**
- 25$ x 3 employes = 75$ par review
- Un avis 5 etoiles vaut ~200$ en acquisition (equivalent SEO/ads)
- ROI : 2.7x sur chaque bonus
- Les employes deviennent proactifs : "Laissez-nous un avis!"
- Objectif : 15-25 reviews/mois haute saison = 375-625$/mois en bonus

### 2. Commission Referral (50$ par client converti)

```
FLOW :

Client satisfait recoit SMS referral (J+7)
"Referez un ami → 50$ credit pour vous!"
    │
    ▼
Ami du client contacte Haie Lite
(via lien referral, telephone, ou mentionne le nom)
    │
    ▼
Systeme identifie le referrer
    │
    ├── Par code referral unique (lien)
    ├── Ou par question VAPI : "Comment avez-vous entendu parler de nous?"
    │   → Si "recommandation de [nom]" → matcher au client original
    │
    ▼
Referee booke un service
    │
    ▼
Systeme trace :
    ├── Referrer (client original) → 50$ credit prochain service
    ├── Equipe qui a servi le referrer → 50$ bonus cash
    │   (parce que c'est LEUR bon travail qui a genere le referral)
    └── Referee → 10% rabais premiere fois
```

**Pourquoi ca marche :**
- L'equipe a un incentive direct a bien travailler : meilleur service = plus de referrals = plus de cash
- CAC referral : 100$ (50$ equipe + 50$ credit client) vs 40-70$ ads
- Mais qualite client referral >> client ads (LTV plus elevee, plus fidele)
- Les employes deviennent ambassadeurs : "Si vous connaissez quelqu'un..."

### 3. Performance Score Mensuel

```
SCORE MENSUEL (sur 100 points) :

PRODUCTIVITE (40 points)
├── Jobs completes vs objectif    : /20 pts
│   (ex: 120 jobs/mois objectif equipe)
│   100% = 20pts, 90% = 16pts, 80% = 12pts
│
└── Revenus generes vs objectif   : /20 pts
    (ex: 30,000$/mois objectif equipe)

QUALITE (35 points)
├── Reviews moyennes              : /15 pts
│   5.0★ = 15pts, 4.5★ = 12pts, 4.0★ = 8pts
│
├── Zero plainte                  : /10 pts
│   0 plainte = 10pts, 1 = 5pts, 2+ = 0pts
│
└── Photos avant/apres completes  : /10 pts
    100% = 10pts, 90% = 7pts, <90% = 3pts

FIABILITE (25 points)
├── Ponctualite (arrivee a l'heure) : /15 pts
│   100% = 15pts, 95% = 12pts, 90% = 8pts
│
└── Presence (pas d'absence)       : /10 pts
    0 absence = 10pts, 1 = 7pts, 2+ = 3pts

BONUS MENSUEL :
├── Score 90-100 : 15% du salaire mensuel (~400-600$)
├── Score 80-89  : 10% du salaire mensuel (~250-400$)
├── Score 70-79  : 5% du salaire mensuel (~125-200$)
└── Score < 70   : 0$ (coaching requis)
```

### Tableau de Bord Employe (SMS Hebdo)

```
SMS chaque vendredi 17h a chaque employe :

Miguel — Semaine 12 :

Jobs : 28/30 (93%) ★★★★☆
Reviews : 2 × 5★ (+50$ bonus!)
Referrals : 1 converti (+50$!)
Ponctualite : 100% ★★★★★
Photos : 28/28 ★★★★★

Score partiel : 88/100
Bonus projete : ~350$

Bravo Miguel! Continue comme ca!
```

---

## COMMISSIONS D'UPSELL

### 4. Commission Upsell (services additionnels)

Les employes sur le terrain sont les MIEUX places pour identifier les opportunites. Quand ils voient des cedres morts, une haie malade, ou un client qui beneficierait de fertilisation, ils sont payes pour le signaler.

### Services Upsellables et Commissions

```
SERVICE                    PRIX CLIENT      COMMISSION EMPLOYE    MARGE
─────────────────────────────────────────────────────────────────────────
Fertilisation (deep root)  75-150$/app      15$/upsell vendu      ~70%
Traitement anti-parasites  100-200$/trait   20$/upsell vendu      ~65%
Protection hivernale       150-350$/haie    25$/upsell vendu      ~60%
Rabattage severe           1,700-2,800$     3% de la valeur       ~55%
Remplacement cedres morts  75-150$/cedre    10$/cedre upsold      ~50%
Paillis base de haie       100-250$/haie    15$/upsell vendu      ~65%
```

### Flow Terrain : Comment un Employe Upsell

```
Employe sur le chantier (taille de haie)
    │
    ├── 1. OBSERVE un probleme/opportunite
    │      Ex: 4 cedres bruns, araignees rouges, haie trop haute
    │
    ├── 2. PREND UNE PHOTO (ServiceM8 app)
    │      Cadrer le probleme clairement
    │
    ├── 3. NOTE dans ServiceM8 (champ "Upsell")
    │      Format: "UPSELL: [type] - [description]"
    │      Ex: "UPSELL: cedres_morts - 4 cedres bruns cote nord"
    │      Ex: "UPSELL: fertilisation - haie jaunie, manque nutriments"
    │
    └── 4. SYSTEME AUTOMATIQUE fait le reste :
           │
           ├── Webhook ServiceM8 → API detecte note "UPSELL:"
           ├── Genere soumission automatique avec prix
           ├── SMS au client :
           │   "Bonjour [Nom]! Notre equipe a remarque que
           │    [description]. Nous recommandons [service]
           │    pour [benefice]. Prix: [X]$.
           │    Repondez OUI pour booker."
           ├── Si OUI → nouveau job ServiceM8 (status: Quote)
           ├── Quand job complete → commission creditee
           └── SMS employe : "+[X]$ commission! Merci [prenom]."
```

### Script d'Upsell Terrain (Formation Employes)

```
CE QUE L'EMPLOYE DIT AU CLIENT (optionnel, le SMS fait le gros du travail) :

"Monsieur/Madame [Nom], j'ai remarque que [observation].
 Si vous voulez, on peut [solution proposee].
 On va vous envoyer l'information par texto."

EXEMPLES :

Cedres morts :
"J'ai remarque que vous avez 3-4 cedres bruns dans votre haie.
 On peut les remplacer pour garder votre haie uniforme.
 On va vous envoyer un prix par texto."

Fertilisation :
"Votre haie pourrait beneficier d'une fertilisation.
 Ca renforce les racines et rend les cedres plus verts et plus denses.
 Je vous envoie l'info par texto."

Parasites :
"J'ai vu des signes d'araignees rouges sur vos cedres.
 Si c'est pas traite, ca peut se propager.
 On offre un traitement, je vous envoie les details."
```

### Projection Financiere des Upsells

```
SCENARIO 2M$ (3,500 clients/saison) :

Fertilisation :
  Taux d'adoption : 15% des clients = 525 clients
  3 applications × 112$/app = 336$/client/an
  Revenue : 176,400$/an
  Commission : 525 × 3 × 15$ = 23,625$/an

Traitement parasites :
  Taux d'adoption : 8% = 280 clients
  1.5 traitements × 150$ = 225$/client
  Revenue : 63,000$/an
  Commission : 280 × 1.5 × 20$ = 8,400$/an

Protection hivernale :
  Taux d'adoption : 10% = 350 clients
  1 installation × 250$ = 250$/client
  Revenue : 87,500$/an
  Commission : 350 × 25$ = 8,750$/an

Rabattage severe :
  Taux d'adoption : 5% = 175 clients
  1 job × 2,000$ = 2,000$/client
  Revenue : 350,000$/an
  Commission : 175 × 60$ (3%) = 10,500$/an

Remplacement cedres :
  Taux d'adoption : 12% = 420 clients
  3 cedres × 100$ = 300$/client
  Revenue : 126,000$/an
  Commission : 420 × 3 × 10$ = 12,600$/an

Paillis :
  Taux d'adoption : 10% = 350 clients
  1 application × 175$ = 175$/client
  Revenue : 61,250$/an
  Commission : 350 × 15$ = 5,250$/an

═══════════════════════════════════════════════
TOTAL UPSELL REVENUE : 864,150$/an
TOTAL COMMISSIONS    :  69,125$/an
MARGE NETTE UPSELL   : ~63% apres commissions
═══════════════════════════════════════════════

Avec les upsells, le CA total potentiel :
  Base (taille)  : 2,000,000$
  Upsells        :   864,150$
  TOTAL          : 2,864,150$ ← presque 3M$
```

---

## TABLES SUPABASE

```sql
-- Employes (synced depuis ServiceM8 staff)
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicem8_staff_uuid TEXT UNIQUE NOT NULL,
  employeur_d_id TEXT,              -- ID dans Employeur D
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  hourly_rate DECIMAL(6,2) NOT NULL,
  role TEXT CHECK (role IN ('chef', 'tet', 'student')),
  truck TEXT,                        -- 'truck_nord', 'truck_sud'
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Heures travaillees (sync quotidien depuis ServiceM8)
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  date DATE NOT NULL,
  job_uuid TEXT,                     -- ServiceM8 job
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  hours DECIMAL(4,2),               -- calculee automatiquement
  job_revenue DECIMAL(10,2),        -- part du revenu du job
  is_overtime BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'servicem8',   -- 'servicem8' ou 'manual'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, date, job_uuid)
);

CREATE INDEX idx_timesheets_date ON timesheets(date);
CREATE INDEX idx_timesheets_employee ON timesheets(employee_id);

-- Incentives
CREATE TABLE employee_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  type TEXT NOT NULL CHECK (type IN ('review_bonus', 'referral_commission', 'performance_bonus', 'upsell_commission')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  -- Linkage
  google_review_id TEXT,             -- pour review bonus
  referral_id UUID,                  -- pour referral commission
  job_uuid TEXT,                     -- job qui a genere le bonus
  month TEXT,                        -- '2026-03' pour performance
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  approved_by TEXT,                  -- Henri ou Jean-Samuel
  paid_at TIMESTAMPTZ,
  pay_period TEXT,                   -- reference Employeur D
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_incentives_employee ON employee_incentives(employee_id);
CREATE INDEX idx_incentives_status ON employee_incentives(status);
CREATE INDEX idx_incentives_month ON employee_incentives(month);

-- Score de performance mensuel
CREATE TABLE performance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  month TEXT NOT NULL,               -- '2026-03'
  -- Productivite (40 pts)
  jobs_completed INTEGER DEFAULT 0,
  jobs_target INTEGER DEFAULT 0,
  jobs_score INTEGER DEFAULT 0,
  revenue_generated DECIMAL(10,2) DEFAULT 0,
  revenue_target DECIMAL(10,2) DEFAULT 0,
  revenue_score INTEGER DEFAULT 0,
  -- Qualite (35 pts)
  avg_review_rating DECIMAL(3,2),
  review_score INTEGER DEFAULT 0,
  complaints INTEGER DEFAULT 0,
  complaint_score INTEGER DEFAULT 0,
  photos_completion_pct DECIMAL(5,2),
  photos_score INTEGER DEFAULT 0,
  -- Fiabilite (25 pts)
  punctuality_pct DECIMAL(5,2),
  punctuality_score INTEGER DEFAULT 0,
  absences INTEGER DEFAULT 0,
  absence_score INTEGER DEFAULT 0,
  -- Total
  total_score INTEGER DEFAULT 0,
  bonus_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, month)
);

-- Daily payroll summary (pour le rapport a Henri)
CREATE TABLE daily_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_hours DECIMAL(6,2),
  total_labor_cost DECIMAL(10,2),
  total_revenue DECIMAL(10,2),
  margin_pct DECIMAL(5,2),
  jobs_completed INTEGER,
  employees_active INTEGER,
  breakdown JSONB,                   -- detail par employe
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunites d'upsell flaggees par les employes
CREATE TABLE upsell_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_uuid TEXT NOT NULL,                -- job original (taille de haie)
  employee_id UUID REFERENCES employees(id),
  service_type TEXT NOT NULL CHECK (service_type IN (
    'fertilisation', 'pest_treatment', 'winter_protection',
    'rejuvenation', 'cedar_replacement', 'mulching'
  )),
  description TEXT,
  photo_url TEXT,
  estimated_value DECIMAL(10,2),
  -- Pipeline
  status TEXT DEFAULT 'flagged' CHECK (status IN (
    'flagged', 'quoted', 'accepted', 'completed', 'declined'
  )),
  quote_sent_at TIMESTAMPTZ,
  client_response TEXT,                  -- 'OUI', 'NON', null
  completed_job_uuid TEXT,               -- nouveau job ServiceM8
  -- Commission
  commission_amount DECIMAL(10,2),
  commission_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_upsell_status ON upsell_opportunities(status);
CREATE INDEX idx_upsell_employee ON upsell_opportunities(employee_id);
```

---

## IMPACT FINANCIER DES INCENTIVES

```
COUT MENSUEL ESTIME (5 equipes, haute saison) :

Review Bonus :
  20 reviews/mois × 3 employes × 25$ = 1,500$/mois

Referral Commission :
  5 referrals/mois × 50$ = 250$/mois

Performance Bonus :
  15 employes × ~300$ moyen = 4,500$/mois

TOTAL INCENTIVES : ~6,250$/mois + upsell commissions
                   ~43,750$/saison (7 mois) base
                   + ~69,125$/saison (commissions upsell)
                   = ~112,875$/saison TOTAL

Note: les commissions d'upsell sont AUTO-FINANCEES
par les revenus supplementaires qu'elles generent.
864,150$ revenus upsell - 69,125$ commissions = 795,025$ net

REVENUS SUPPLEMENTAIRES GENERES :

Reviews → meilleur SEO → +15-20 clients/mois × 575$ = +10,000$/mois
Referrals → 5 clients/mois × 575$ = +2,875$/mois
Performance → productivite +10-15% = +20,000$/mois

TOTAL REVENUS ADDITIONELS : ~33,000$/mois (hors upsells)
                           + ~123,450$/mois (upsells)
                           = ~156,450$/mois

ROI INCENTIVES : 14x (incluant upsells)

L'incentive se paie 5 fois avec les revenus
supplementaires qu'il genere.
```

---

## IMPLEMENTATION

### Fichiers a creer dans l'app Next.js

```
app/api/
├── cron/
│   ├── sync-timesheets/route.ts    # Sync ServiceM8 → Supabase (toutes les heures)
│   ├── daily-payroll/route.ts      # Rapport masse salariale (17h30)
│   ├── check-google-reviews/route.ts  # Matcher reviews → equipes (quotidien)
│   ├── weekly-employee-report/route.ts # SMS score hebdo (vendredi 17h)
│   └── monthly-performance/route.ts   # Calcul score + bonus (1er du mois)
├── webhooks/
│   └── servicem8-job-completed/route.ts  # Trigger review request
└── payroll/
    └── export/route.ts             # CSV pour Employeur D
```

### Priorite de deploiement

```
SEMAINE 1 : Time tracking
  □ Sync ServiceM8 JobActivity → Supabase timesheets
  □ Rapport SMS quotidien masse salariale
  □ Export CSV Employeur D

SEMAINE 2 : Review Bonus
  □ Google Business Profile API integration
  □ Matching review → job → equipe
  □ SMS notification bonus

SEMAINE 3 : Referral + Performance
  □ Tracking referral → equipe originale
  □ Score de performance mensuel
  □ SMS hebdo employe
```

---

*Compile le 20 fevrier 2026*
