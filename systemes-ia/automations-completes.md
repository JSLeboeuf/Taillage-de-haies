# Automations Completes Haie Lite

> Tous les rapports et automations par frequence

---

## QUOTIDIEN (Daily)

### 1. KPI Dashboard Operationnel

**Envoi** : 7h00 AM (avant debut journee)
**Destinataires** : Henri, Chefs d'equipe
**Canal** : SMS + Slack/WhatsApp

```
📊 DAILY REPORT - [Date]

HIER :
├── Jobs completes : 24/28 (86%)
├── Revenus : 12,450$
├── Clients nouveaux : 3
└── Reviews recues : 2 ⭐⭐⭐⭐⭐

AUJOURD'HUI :
├── Jobs schedules : 32
├── Revenus prevus : 16,000$
├── Equipes actives : 4/4
└── Meteo : ☀️ 22°C

⚠️ ALERTES :
├── 2 jobs sans confirmation client
└── TET #3 absent (maladie)
```

### 2. Alerte Leads Non-Traites

**Envoi** : 10h00 AM + 3h00 PM
**Destinataires** : Responsable ventes
**Declencheur** : Lead > 2h sans reponse

```
🚨 3 LEADS EN ATTENTE

1. Marie Tremblay - Brossard
   Demande : Taillage haies cèdres
   Reçu : il y a 2h45
   📞 514-555-1234
   [APPELER] [ASSIGNER]

2. ...
```

### 3. Confirmation Jobs Automatique

**Envoi** : 18h00 (veille du job)
**Destinataires** : Clients
**Canal** : SMS

```
Bonjour [Prenom]!

Rappel : votre taillage de haies est prévu
demain [Date] entre [Heure].

Notre équipe sera sur place. Pas besoin
d'être présent, juste que l'accès soit libre.

Questions? Répondez à ce texto.

- Haie Lite 🌿
```

### 4. Rapport Fin de Journee Equipes

**Envoi** : 17h30 (auto-genere)
**Source** : Jobber + GPS
**Destinataires** : Henri

```
📍 FIN DE JOURNÉE - [Date]

ÉQUIPE 1 (Chef: Marc)
├── Jobs : 8/8 ✓
├── Revenus : 4,200$
├── Km parcourus : 67 km
├── Temps productif : 7.2h
└── Photos uploadees : 16/16 ✓

ÉQUIPE 2 (Chef: Pierre)
├── Jobs : 7/8 (1 reporté)
├── Revenus : 3,100$
├── Km parcourus : 82 km
├── Temps productif : 6.8h
└── Photos uploadees : 14/16 ⚠️

[...]
```

### 5. Alerte Equipement/Maintenance

**Declencheur** : Seuil atteint
**Destinataires** : Henri + Chef concerne

```
🔧 MAINTENANCE REQUISE

Véhicule : Truck #2 (Ford F-150)
Kilométrage : 49,850 km
Prochain service : 50,000 km

Action : Planifier changement huile
cette semaine.

[MARQUER FAIT] [REPORTER]
```

---

## HEBDOMADAIRE (Weekly)

### 6. Weekly Scorecard (Codie Sanchez Style)

**Envoi** : Dimanche 20h00
**Destinataires** : Henri, Jean-Samuel
**Format** : Email + PDF

```
📈 WEEKLY SCORECARD - Semaine [#]

                    RÉEL      CIBLE     DELTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Revenus            $48,200   $45,000   +7.1% ✓
Jobs complétés     96        90        +6.7% ✓
Nouveaux clients   12        15        -20% ⚠️
Reviews 5★         8         10        -20% ⚠️
Leads générés      34        30        +13% ✓
Taux conversion    35%       40%       -5% ⚠️
Heures/TET         42h       40h       +5%
Cash en banque     $127,450  $100k+    ✓

TOP PERFORMER : Équipe Marc (112% objectif)
À AMÉLIORER : Conversion leads → clients

ACTIONS CETTE SEMAINE :
☐ Revoir script appel leads
☐ Bonus équipe Marc
☐ Follow-up 5 devis en attente
```

### 7. Pipeline M&A Status

**Envoi** : Lundi 8h00
**Destinataires** : Jean-Samuel
**Source** : Deal Tracker spreadsheet

```
🏢 M&A PIPELINE - Semaine [#]

ACTIFS : 12 deals

HOT (négociation) :
├── Paysagement Laval Inc. - 450k$ CA
│   Status : LOI envoyée, attente réponse
│   Next : Follow-up mercredi
│
└── Entretien Vaudreuil - 280k$ CA
    Status : Meeting #2 planifié
    Next : Jeudi 14h

WARM (discussion) : 4 deals
COLD (à contacter) : 6 deals

CETTE SEMAINE :
☐ 3 cold calls à faire
☐ 1 meeting site visit
☐ Relance LOI Laval
```

### 8. Rapport TET Performance

**Envoi** : Vendredi 17h00
**Destinataires** : Henri
**Source** : Jobber + Timesheets

```
👷 PERFORMANCE TET - Semaine [#]

                   JOBS   $/JOUR   QUALITÉ   PONCTUALITÉ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Miguel (TET #1)    28     $2,240   98%       100% ⭐
Carlos (TET #2)    26     $2,080   95%       95%
José (TET #3)      24     $1,920   92%       90%
Pedro (TET #4)     27     $2,160   96%       100%

MOYENNE ÉQUIPE : $2,100/jour (cible: $2,000) ✓

NOTES :
- Miguel : Prêt pour formation chef d'équipe
- José : Retard x2 cette semaine, coaching requis
```

### 9. Inventaire & Approvisionnement

**Envoi** : Dimanche 18h00
**Destinataires** : Henri
**Source** : Inventaire manuel + consommation

```
📦 INVENTAIRE - Semaine [#]

À COMMANDER CETTE SEMAINE :

URGENT (stock < 1 semaine) :
├── Huile taille-haies : 2L restants
│   Commander : 10L [$89]
│
└── Gants travail M : 3 paires
    Commander : 12 paires [$156]

BIENTÔT (stock < 2 semaines) :
├── Cordes remorque : 4 restantes
├── Lunettes sécurité : 6 restantes
└── Sacs déchets : ~50 restants

BUDGET ESTIMÉ : $420

[COMMANDER AMAZON] [VOIR DÉTAILS]
```

### 10. Clients À Risque / Churn

**Envoi** : Lundi 9h00
**Destinataires** : Henri
**Source** : Jobber + historique

```
⚠️ CLIENTS À RISQUE - [Date]

PAS DE SERVICE DEPUIS 18+ MOIS :

1. Jean-Pierre Gagnon - Candiac
   Dernier service : Mars 2024
   Valeur annuelle : $1,200
   📞 450-555-1234
   [APPELER] [ENVOYER PROMO]

2. Famille Bouchard - La Prairie
   Dernier service : Janvier 2024
   Valeur annuelle : $800
   Note : "Prix trop élevé" (2024)
   [APPELER AVEC RABAIS]

TOTAL CLIENTS À RISQUE : 23
VALEUR ANNUELLE EN JEU : $18,400
```

---

## MENSUEL (Monthly)

### 11. P&L Flash Report

**Envoi** : 3e jour du mois
**Destinataires** : Henri, Jean-Samuel
**Format** : PDF + Dashboard

```
💰 P&L FLASH - [Mois Année]

REVENUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Taillage haies        $142,300   (78%)
Gouttières            $28,400    (16%)
Vitres                $11,200    (6%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL REVENUS         $181,900

DÉPENSES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Salaires TET          $52,000    (29%)
Salaires chefs        $24,000    (13%)
Carburant             $8,400     (5%)
Équipement/entretien  $4,200     (2%)
Marketing             $3,600     (2%)
Assurances            $2,800     (2%)
Autres                $5,100     (3%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL DÉPENSES        $100,100   (55%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EBITDA                $81,800    (45%)
vs Budget             +12%       ✓
vs Mois dernier       +8%        ✓

CASH POSITION : $234,500
RUNWAY : 4.2 mois
```

### 12. Rapport Marketing & Acquisition

**Envoi** : 5e jour du mois
**Destinataires** : Jean-Samuel
**Source** : Google Ads, Facebook, Agent IA

```
📣 MARKETING REPORT - [Mois]

SOURCES DE LEADS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Agent IA (téléphone)   89    (42%)   $12/lead
Google Ads             62    (29%)   $28/lead
Facebook Ads           34    (16%)   $22/lead
Référencement          18    (8%)    $0/lead
Porte-à-porte          11    (5%)    $45/lead*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL LEADS            214

CONVERSION FUNNEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Leads → Devis          68%   (146)
Devis → Booking        52%   (76)
Booking → Complété     95%   (72)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSION TOTALE      34%

CAC (Coût Acquisition Client) : $47
LTV (Valeur Vie Client) : $1,800
LTV:CAC Ratio : 38:1 ✓ (cible: 3:1+)

TOP PERFORMING AD :
"Taillage haies 20% rabais nouveau client"
CTR: 4.2% | Conv: 8.1%
```

### 13. Employee Satisfaction & Retention

**Envoi** : 15e jour du mois
**Destinataires** : Henri, Jean-Samuel
**Source** : Pulse survey (5 questions)

```
👥 TEAM PULSE - [Mois]

PARTICIPATION : 18/20 (90%)

                              SCORE   TREND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Satisfaction générale         8.2/10  ↑ +0.3
Charge de travail équitable   7.8/10  → stable
Communication claire          8.5/10  ↑ +0.5
Équipement adéquat           7.2/10  ↓ -0.4 ⚠️
Recommanderait l'entreprise   8.7/10  ↑ +0.2

COMMENTAIRES ANONYMES :
- "Besoin de nouveaux taille-haies, usés"
- "Super ambiance d'équipe!"
- "Plus de training sur vitres SVP"

ACTIONS SUGGÉRÉES :
☐ Budget équipement : +$2,000
☐ Formation vitres : planifier
```

### 14. Rapport Qualité & Reviews

**Envoi** : 1er jour du mois
**Destinataires** : Henri
**Source** : Google, Facebook, Jobber

```
⭐ QUALITY REPORT - [Mois]

REVIEWS RECUES : 34

DISTRIBUTION :
★★★★★  28  (82%)
★★★★☆   4  (12%)
★★★☆☆   1  (3%)
★★☆☆☆   1  (3%)
★☆☆☆☆   0  (0%)

SCORE MOYEN : 4.7/5 (cible: 4.5+) ✓

GOOGLE RATING : 4.8 (312 reviews)
FACEBOOK RATING : 4.6 (89 reviews)

PLAINTES CE MOIS : 2
├── Délai reporté (résolu - rabais 10%)
└── Haie trop courte (résolu - retouche gratuite)

TOP COMMENTAIRES :
"Équipe super professionnelle!" - Marie L.
"Travail impeccable, je recommande" - Pierre G.
```

### 15. Cash Flow Forecast (Rolling 3 mois)

**Envoi** : 1er jour du mois
**Destinataires** : Jean-Samuel
**Format** : Spreadsheet + graphique

```
💵 CASH FLOW FORECAST

                    [Mois]    [M+1]     [M+2]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENTRÉES
Revenus services    $182k     $195k     $178k
Paiements AR        $12k      $8k       $10k
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total entrées       $194k     $203k     $188k

SORTIES
Salaires            $78k      $82k      $82k
Fournisseurs        $15k      $18k      $14k
Prêt BDC            $8k       $8k       $8k
Balance vendeur     $5k       $5k       $5k
Impôts estimés      $22k      —         —
Autres fixes        $12k      $12k      $12k
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total sorties       $140k     $125k     $121k

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CASH FLOW NET       +$54k     +$78k     +$67k
CASH FIN MOIS       $288k     $366k     $433k

⚠️ ALERTES :
- Paiement impôts [Mois] : prévoir $22k
- TET bonus fin saison [M+2] : prévoir $15k
```

---

## TRIMESTRIEL (Quarterly)

### 16. Business Review Complet

**Envoi** : 7e jour du trimestre
**Destinataires** : Henri, Jean-Samuel
**Format** : Deck PDF 20 pages

```
📊 Q[X] BUSINESS REVIEW

SECTIONS :
1. Executive Summary
2. Revenus vs Objectifs
3. P&L détaillé par OpCo
4. KPIs opérationnels
5. Performance équipes
6. Marketing ROI
7. M&A Pipeline status
8. Cash & Financement
9. Risques & Opportunités
10. Objectifs Q+1
```

### 17. TET Contract Review

**Envoi** : 60 jours avant fin saison
**Destinataires** : Jean-Samuel
**Source** : FERME, contrats

```
📋 TET CONTRACT REVIEW - Q[X]

CONTRATS ACTUELS :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TET     Début      Fin        Renouveler?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Miguel  01/05/25   31/10/25   ✓ OUI
Carlos  01/05/25   31/10/25   ✓ OUI
José    15/05/25   31/10/25   ? À évaluer
Pedro   01/06/25   31/10/25   ✓ OUI

ACTIONS REQUISES :
☐ Soumettre EIMT renouvellement (deadline: [Date])
☐ Confirmer logement 2026
☐ Meeting FERME : [Date]
☐ Évaluation José avec Henri
```

### 18. Equipment Depreciation & CAPEX

**Envoi** : Fin de trimestre
**Destinataires** : Jean-Samuel
**Source** : Asset register

```
🚛 CAPEX REPORT - Q[X]

ÉQUIPEMENT ACTUEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Item              Achat    Valeur    Vie Rest.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Truck #1          $45k     $28k      3 ans
Truck #2          $38k     $22k      2 ans
Remorque #1       $8k      $4k       4 ans
Taille-haies (8)  $12k     $6k       2 ans
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL ASSETS      $103k    $60k

CAPEX PRÉVU PROCHAIN TRIMESTRE :
├── Nouveau truck : $42k (lease)
├── Équipement vitres : $5k
└── Outils remplacement : $3k
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL CAPEX Q+1 : $50k
```

---

## ANNUEL (Yearly)

### 19. Annual Business Review

**Envoi** : Janvier 15
**Format** : Presentation + financiers audités

```
📅 ANNUAL REVIEW [Année]

• Revenus annuels vs plan
• EBITDA et marges
• Croissance YoY
• Acquisitions complétées
• Nouveaux services lancés
• Performance par OpCo
• ROI marketing annuel
• Équipe : embauches, départs
• Objectifs année suivante
• Budget approuvé
```

### 20. Tax Planning & Compliance

**Envoi** : Novembre 1 (avant fin année fiscale)
**Destinataires** : Jean-Samuel + Comptable

```
📋 TAX PLANNING - [Année]

ESTIMATIONS :
├── Revenus projetés : $1.2M
├── EBITDA projeté : $180k
├── Impôts estimés : $45k

OPTIMISATIONS POSSIBLES :
☐ Maximiser CAPEX avant 31/12
☐ Bonus TET (déductible)
☐ Dividendes vs salaire split
☐ REER employeur
☐ Crédits RS&DE (agent IA?)

DEADLINES :
├── T4/Relevé 1 : 28 février
├── Déclaration corpo : [Date]
└── Acomptes provisionnels : [Dates]
```

---

## AUTOMATIONS ÉVÉNEMENTIELLES (Triggers)

### 21. Nouveau Lead Reçu

**Trigger** : Lead entre dans système
**Action** : Notification immédiate + assignation

```
🔔 NOUVEAU LEAD

Nom : [Nom]
Téléphone : [Tel]
Service : Taillage haies
Zone : Brossard
Source : Google Ads

Assigné à : [Agent IA → Henri si >2h]

[APPELER] [VOIR FICHE]
```

### 22. Job Complété

**Trigger** : Chef marque job "done" dans Jobber
**Actions** :
1. SMS client demande review
2. Photo before/after sauvegardée
3. Facture générée

```
SMS AU CLIENT (2h après) :

Merci [Prénom]! Votre taillage est complété.

Satisfait? 30 secondes pour nous laisser
un avis Google : [lien]

Votre facture : [lien]

Merci! - Haie Lite 🌿
```

### 23. Paiement En Retard

**Trigger** : Facture > 30 jours
**Actions** : Séquence de rappels

```
JOUR 30 - Email doux :
"Petit rappel amical, facture #123..."

JOUR 45 - SMS + Email :
"Votre facture est en souffrance..."

JOUR 60 - Appel Henri :
"[Client] - $450 - 60 jours retard
Appeler aujourd'hui"

JOUR 90 - Collection notice
```

### 24. Review Négative (< 4 étoiles)

**Trigger** : Review Google/Facebook < 4★
**Action** : Alerte immédiate Henri

```
🚨 REVIEW NÉGATIVE

Plateforme : Google
Client : Marc Dupont
Note : ★★☆☆☆
Commentaire : "Haies coupées trop court,
déçu du résultat"

ACTIONS :
1. [RÉPONDRE PUBLIQUEMENT]
2. [APPELER CLIENT]
3. [CRÉER TICKET QUALITÉ]

Temps de réponse cible : < 4h
```

### 25. Météo Défavorable

**Trigger** : Prévision pluie/orage > 70%
**Action** : Notification équipes + clients

```
⛈️ ALERTE MÉTÉO - [Date]

Prévision : Pluie forte 10h-16h
Probabilité : 85%

JOBS AFFECTÉS : 12

OPTIONS :
☐ Reporter tous les jobs
☐ Maintenir jobs AM seulement
☐ Appeler clients un par un

[REPORTER TOUS] [DÉCIDER MANUELLEMENT]
```

---

## STACK TECHNIQUE (Pattern VETA)

### Architecture Serverless

| Fonction | Outil | Coût/mois |
|----------|-------|-----------|
| CRM/Dispatch | Jobber | $129 |
| **Cron Jobs** | Vercel Cron | $0 (inclus Pro) |
| **Database** | Supabase | $25 |
| **Email** | Resend | $20 |
| Agent IA | VAPI + Twilio | $100 |
| SMS | Twilio | ~$30 |
| Cache/Rate Limit | Upstash Redis | $10 |
| Push Notifications | APNs + FCM | $0 |
| **TOTAL** | | **~$314/mois** |

### Architecture (Même Pattern que VETA)

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL                             │
│  ┌─────────────────────────────────────────────┐    │
│  │  vercel.json (cron definitions)              │    │
│  │  ├── daily-kpi-report     (12:30 daily)     │    │
│  │  ├── weekly-scorecard     (20:00 sunday)    │    │
│  │  ├── lead-followup        (*/15 * * * *)    │    │
│  │  ├── payment-reminders    (09:00 daily)     │    │
│  │  └── weather-alerts       (06:00 daily)     │    │
│  └─────────────────────────────────────────────┘    │
│                       │                              │
│                       ▼                              │
│  ┌─────────────────────────────────────────────┐    │
│  │  /api/cron/*.js (serverless functions)       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
     ┌────────┐    ┌──────────┐   ┌─────────┐
     │ Jobber │    │ Supabase │   │ Resend  │
     │  API   │    │    DB    │   │ (email) │
     └────────┘    └──────────┘   └─────────┘
          │              │
          ▼              ▼
     ┌────────┐    ┌──────────┐
     │ Twilio │    │  VAPI    │
     │ (SMS)  │    │(Agent IA)│
     └────────┘    └──────────┘
```

### Structure Fichiers

```
haie-lite-app/
├── vercel.json                 # Cron definitions
├── api/
│   ├── cron/
│   │   ├── daily-kpi-report.js
│   │   ├── weekly-scorecard.js
│   │   ├── monthly-pnl.js
│   │   ├── lead-followup.js
│   │   ├── payment-reminders.js
│   │   ├── review-requests.js
│   │   ├── weather-alerts.js
│   │   ├── inventory-check.js
│   │   ├── tet-performance.js
│   │   └── mna-pipeline.js
│   ├── webhooks/
│   │   ├── jobber.js           # Job completed, new booking
│   │   ├── stripe.js           # Payments
│   │   └── twilio.js           # SMS replies
│   └── internal/
│       ├── send-sms.js
│       ├── send-email.js
│       └── notify-slack.js
├── lib/
│   ├── cronMonitor.js          # Execution tracking
│   ├── cron-auth.js            # Auth verification
│   ├── jobber-client.js        # Jobber API wrapper
│   ├── resend-client.js        # Email sending
│   └── supabase-client.js      # DB client
└── supabase/
    └── migrations/
        ├── 001_cron_executions.sql
        ├── 002_kpi_daily.sql
        └── 003_alerts.sql
```

---

## VERCEL.JSON (Cron Definitions)

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-kpi-report",
      "schedule": "30 12 * * *"
    },
    {
      "path": "/api/cron/daily-job-summary",
      "schedule": "30 17 * * *"
    },
    {
      "path": "/api/cron/lead-followup",
      "schedule": "0 10,15 * * *"
    },
    {
      "path": "/api/cron/job-confirmation-sms",
      "schedule": "0 18 * * *"
    },
    {
      "path": "/api/cron/review-requests",
      "schedule": "0 19 * * *"
    },
    {
      "path": "/api/cron/payment-reminders",
      "schedule": "0 9 * * 1-5"
    },
    {
      "path": "/api/cron/weather-alerts",
      "schedule": "0 6 * * *"
    },
    {
      "path": "/api/cron/weekly-scorecard",
      "schedule": "0 20 * * 0"
    },
    {
      "path": "/api/cron/weekly-tet-performance",
      "schedule": "0 17 * * 5"
    },
    {
      "path": "/api/cron/weekly-inventory",
      "schedule": "0 18 * * 0"
    },
    {
      "path": "/api/cron/weekly-churn-risk",
      "schedule": "0 9 * * 1"
    },
    {
      "path": "/api/cron/mna-pipeline-status",
      "schedule": "0 8 * * 1"
    },
    {
      "path": "/api/cron/monthly-pnl",
      "schedule": "0 8 3 * *"
    },
    {
      "path": "/api/cron/monthly-marketing-report",
      "schedule": "0 9 5 * *"
    },
    {
      "path": "/api/cron/monthly-quality-report",
      "schedule": "0 8 1 * *"
    },
    {
      "path": "/api/cron/monthly-cashflow-forecast",
      "schedule": "0 10 1 * *"
    },
    {
      "path": "/api/cron/system-health",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

### Cron Schedule Reference

| Expression | Signification |
|------------|---------------|
| `30 12 * * *` | 12h30 tous les jours |
| `0 20 * * 0` | 20h00 dimanche |
| `0 9 * * 1-5` | 9h00 lundi-vendredi |
| `0 8 3 * *` | 8h00 le 3 du mois |
| `0 */4 * * *` | Toutes les 4 heures |
| `0 10,15 * * *` | 10h00 et 15h00 |

---

## TABLES SUPABASE

### cron_executions (Monitoring)

```sql
CREATE TABLE cron_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cron_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'timeout', 'skipped')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  summary JSONB,
  error_message TEXT,
  email_sent BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_cron_executions_name ON cron_executions(cron_name);
CREATE INDEX idx_cron_executions_started ON cron_executions(started_at DESC);
```

### operational_kpis_daily

```sql
CREATE TABLE operational_kpis_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  revenue DECIMAL(12,2),
  jobs_completed INTEGER,
  jobs_scheduled INTEGER,
  new_clients INTEGER,
  leads_generated INTEGER,
  conversion_rate DECIMAL(5,2),
  avg_job_value DECIMAL(10,2),
  reviews_received INTEGER,
  avg_rating DECIMAL(3,2),
  tet_hours_total DECIMAL(8,2),
  tet_productivity DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### alerts

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('info', 'warning', 'critical')),
  title TEXT NOT NULL,
  message TEXT,
  source TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## EXEMPLE CRON FUNCTION

### /api/cron/daily-kpi-report.js

```javascript
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { verifyCronAuth } from '../../lib/cron-auth';
import { trackCronExecution } from '../../lib/cronMonitor';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Verify cron authentication
  if (!verifyCronAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const startTime = Date.now();
  let status = 'success';
  let summary = {};
  let errorMessage = null;

  try {
    // 1. Fetch data from Jobber API
    const jobberData = await fetchJobberDailyStats();

    // 2. Calculate KPIs
    const kpis = {
      date: new Date().toISOString().split('T')[0],
      revenue: jobberData.totalRevenue,
      jobs_completed: jobberData.completedJobs,
      jobs_scheduled: jobberData.scheduledJobs,
      new_clients: jobberData.newClients,
      avg_job_value: jobberData.totalRevenue / jobberData.completedJobs,
      reviews_received: jobberData.reviews.length,
      avg_rating: calculateAvgRating(jobberData.reviews)
    };

    // 3. Store in Supabase
    await supabase
      .from('operational_kpis_daily')
      .upsert(kpis, { onConflict: 'date' });

    // 4. Generate email HTML
    const emailHtml = generateDailyReportEmail(kpis);

    // 5. Send email via Resend
    await resend.emails.send({
      from: 'Haie Lite <reports@haielite.com>',
      to: [process.env.OWNER_EMAIL, process.env.COO_EMAIL],
      subject: `📊 Daily KPI Report - ${kpis.date}`,
      html: emailHtml
    });

    summary = { kpis, emailSent: true };

  } catch (error) {
    status = 'error';
    errorMessage = error.message;
    console.error('Daily KPI Report failed:', error);
  }

  // Track execution
  await trackCronExecution({
    cronName: 'daily-kpi-report',
    status,
    durationMs: Date.now() - startTime,
    summary,
    errorMessage
  });

  return res.status(status === 'success' ? 200 : 500).json({
    status,
    duration: Date.now() - startTime,
    summary
  });
}

function generateDailyReportEmail(kpis) {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 600px;">
      <h1 style="color: #4a7c43;">📊 Daily KPI Report</h1>
      <p style="color: #666;">${kpis.date}</p>

      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">Revenue</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold; color: #4a7c43;">
            $${kpis.revenue.toLocaleString()}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">Jobs Completed</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">
            ${kpis.jobs_completed}/${kpis.jobs_scheduled}
          </td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">New Clients</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">
            ${kpis.new_clients}
          </td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #ddd;">Avg Job Value</td>
          <td style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">
            $${kpis.avg_job_value.toFixed(0)}
          </td>
        </tr>
        <tr style="background: #f5f5f5;">
          <td style="padding: 12px;">Reviews (Avg Rating)</td>
          <td style="padding: 12px; text-align: right;">
            ${kpis.reviews_received} (${kpis.avg_rating.toFixed(1)}⭐)
          </td>
        </tr>
      </table>

      <p style="margin-top: 20px; color: #999; font-size: 12px;">
        Haie Lite Automated Report
      </p>
    </div>
  `;
}
```

---

## WEBHOOKS (Event Triggers)

### /api/webhooks/jobber.js

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const event = req.body;

  switch (event.type) {
    case 'job.completed':
      // Trigger review request SMS (2h delay)
      await scheduleReviewRequest(event.data.client, event.data.job);
      // Update daily stats
      await incrementDailyJobCount();
      break;

    case 'quote.accepted':
      // Notify Henri
      await sendSMS(process.env.HENRI_PHONE,
        `🎉 Nouveau booking! ${event.data.client.name} - $${event.data.total}`
      );
      break;

    case 'invoice.overdue':
      // Add to payment reminder queue
      await addToPaymentReminders(event.data.invoice);
      break;
  }

  return res.status(200).json({ received: true });
}
```

---

## PRIORISATION DÉPLOIEMENT

### Phase 1 : Essentiels (Mois 1-2)

1. ✅ Daily job report
2. ✅ Lead notification
3. ✅ Job completion → review request
4. ✅ Weekly scorecard
5. ✅ Payment reminder sequence

### Phase 2 : Growth (Mois 3-4)

6. Agent IA téléphone
7. Monthly P&L auto
8. Marketing report
9. Weather alerts
10. Inventory tracking

### Phase 3 : Scale (Mois 5-6)

11. M&A pipeline tracking
12. TET performance dashboards
13. Cash flow forecasting
14. Quality monitoring
15. Full quarterly reviews

---

## ROI ESTIMÉ DES AUTOMATIONS

| Automation | Temps Économisé | Valeur/Mois |
|------------|-----------------|-------------|
| Daily reports | 5h/sem | $500 |
| Lead routing | 2h/sem | $800 (leads perdus évités) |
| Review requests | 3h/sem | $600 (plus de reviews) |
| Payment reminders | 4h/mois | $2,000 (AR réduit) |
| Scheduling alerts | 2h/sem | $400 |
| **TOTAL** | **~60h/mois** | **~$4,300/mois** |

**Coût automations** : $350/mois
**ROI** : 12x return ✓
