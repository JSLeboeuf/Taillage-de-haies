# Analyse complète — Repo "Taillage de haies"

> Mise à jour : 2026-03-23

## Vue d'ensemble

Un **business OS complet** pour une entreprise de taillage de haies au Québec. Le repo contient : stratégie d'affaires, documentation opérationnelle, bibliothèque de frameworks business, et une application web full-stack (haie-lite-app).

**Objectif affiché** : 2M$ en 2026 → 20M$ à terme.
**Partenariat** : Jean-Samuel + Henri.

---

## Métriques

| Métrique | Valeur |
|---|---|
| Livres extraits | 14 (~110 000 lignes) |
| Frameworks | 13 synthèses |
| Quick-refs | 10 fiches |
| Documents opérationnels | 30+ |
| API routes (haie-lite-app) | 20+ |
| CRON jobs automatisés | 12 |

---

## Structure des dossiers

```
Taillage de haies/
├── 2026-saison/           ← Plan d'exécution saison 2026
├── books/                 ← Fichiers de livres téléchargés
├── frameworks/            ← 13 livres distillés en frameworks appliqués
├── haie-lite-app/         ← Application Next.js (landing + dashboard + employés)
├── marketing/             ← Brand guidelines + pitch recrutement
├── operations/            ← Deals, KPIs, territoires, acquisitions, recrutement
├── plan-affaires/         ← Plans ultimes, modèles financiers, roadmaps
├── quick-ref/             ← 10 guides de référence rapide
├── recherche-marche/      ← Marché résidentiel QC + appels d'offres
├── scripts/               ← Scripts utilitaires
├── servicem8-docs/        ← Docs API ServiceM8 (27 chapitres)
├── sources-livres/        ← 14 livres en markdown
├── systemes-ia/           ← Workflows d'automatisation IA
└── [docs racine]          ← README, INDEX, PLAYBOOK, APPLICATION, CHECKLISTS
```

---

## 1. Base stratégique (`plan-affaires/`)

| Fichier | Contenu |
|---|---|
| `PLAN-ULTIME-9.5.md` + `REVISE.md` | Plan d'affaires complet + révisions |
| `roadmap-250k-10m.md` | Roadmap de 250k$ → 10M$ |
| `reverse-engineering-20m.md` | Décomposition backward de l'objectif 20M$ |
| `modele-arbitrage-explique.md` | Modèle d'arbitrage de main-d'œuvre |
| `modele-equity-performance.md` | Equity pour les chefs d'équipe |
| `ACCORD-PARTENARIAT.md` | Accord JS / Henri |
| `260k-pour-2-tet.md` | Modèle financier 260k$ pour 2 TET |
| `pain-points-250k.md` | Points de douleur à 250k$ |
| Subventions (Écosys) | Maximisation des subventions gouvernementales |

---

## 2. Saison 2026 (`2026-saison/`)

**Objectif 2M$** avec plan détaillé :

- `EXECUTIVE-SUMMARY.md` — résumé exécutif
- `PLAN-EXECUTION-2M-2026.md` — exécution tactique
- `MODELE-FINANCIER-2026.md` — modèle financier
- `GAMEPLAN-Q2-2026.html` — plan Q2 visuel
- `STRATEGIE-ADS.md` — publicité Meta/Google
- `STRATEGIE-2M-DEEP-RESEARCH.md` — recherche approfondie
- `RECRUTEMENT-ETUDIANTS.md` — recrutement main-d'œuvre
- `SUBVENTIONS-2026.md` — subventions ciblées
- `CIBLES-MA.md` — cibles d'acquisition (M&A)
- `SERVICEM8-INTEGRATION.md` — intégration CRM terrain
- `CALCULATEURS.md` — calculateurs financiers
- `KICKOFF-2026-RENCONTRE-HENRI.md` + `MEETING-HENRI-FEV2026.md` — réunions Henri
- `REUNION-24FEV-TRANSCRIPTION.md` + `WEEKLY-KICKOFF-24FEV2026.md` — réunions opérationnelles
- `TEMPLATE-SUIVI-MENSUEL.md` — template de suivi mensuel
- `courriels/` — 4 séquences email (MEI, MFOR Services Québec, Horticompétences, DEL Longueuil)

---

## 3. Application haie-lite-app (Next.js)

**Stack** : Next.js 14 · React · TypeScript · Tailwind · Supabase · Stripe

### Pages/modules
- **Landing page publique** : HeroSection, QuoteCalculator, Testimonials, ZonesSection, FAQ, Footer
- **Portail employé** (`/employee`) : jobs, score, upsell
- **Dashboard propriétaire** (`/dashboard`) : KPIs, composants de gestion

### API Routes
```
/api/quotes/        → calculate, send-payment
/api/leads/         → create
/api/payroll/       → export
/api/referrals/     → create, stats, track
/api/reviews/       → match-employee
/api/subscriptions/ → create, manage, webhook
/api/upsell/        → flag, quote, convert
/api/commercial/    → pipeline
/api/dashboard/     → kpis
/api/webhooks/      → stripe, servicem8, meta-leads, twilio-sms, vapi
```

### 12 CRON jobs d'automatisation

| CRON | Fonction |
|---|---|
| `daily-kpi` | Calcul KPI quotidien |
| `daily-payroll` | Calcul paie quotidien |
| `lead-followup` | Relance leads |
| `job-confirmation` | Confirmation de travaux |
| `review-request` | Demande de Google Reviews |
| `check-google-reviews` | Surveillance des avis |
| `upsell-followup` | Relance upsell |
| `dormant-reactivation` | Réactivation clients dormants |
| `weather-alert` | Alertes météo |
| `sync-timesheets` | Sync feuilles de temps ServiceM8 |
| `weekly-employee-report` | Rapport hebdo employés |
| `monthly-performance` | Rapport perf mensuel |

### Intégrations externes
- **Stripe** — paiement + abonnements
- **ServiceM8** — gestion terrain (jobs, timesheets)
- **VAPI** — agent vocal IA (devis téléphonique)
- **Twilio SMS** — confirmations + relances
- **Meta Lead Ads** — capture de leads publicitaires

---

## 4. Bibliothèque de frameworks (`frameworks/` + `sources-livres/`)

**14 livres** intégrés et distillés en playbooks applicables :

| Livre | Auteur | Application |
|---|---|---|
| 100M$ Offers / Leads / Money Models | Alex Hormozi | Offres, acquisition clients |
| Main Street Millionaire | Codie Sanchez | Acquisition de PME |
| E-Myth | Michael Gerber | Systèmes + franchise |
| Scaling Up | Verne Harnish | Croissance structurée |
| The Goal | Eliyahu Goldratt | Goulots d'étranglement |
| Road Less Stupid | Keith Cunningham | Décisions stratégiques |
| Asset Protection + Business Wealth | Roland Frasier | Protection + création de richesse |
| Dream Manager | Matthew Kelly | Rétention d'équipes |
| Extreme Ownership | Willink / Babin | Leadership terrain |
| It's Your Ship | Abrashoff | Leadership |
| One Minute Manager | Blanchard | Management quotidien |

---

## 5. Opérations (`operations/`)

### Deals actifs / en cours
- `deal-le-chataignier-robert.md` — Robert Chataignier
- `deal-oscar-rubio.md` — Oscar Rubio
- `deal-perreault-paysagements.md` — Perreault Paysagements

### Gestion
- `pipeline-acquisitions.md` — pipeline d'acquisitions Main Street
- `kpi-chefs-equipe.md` — KPIs par chef d'équipe
- `strategie-equity-chefs.md` — structure equity performance
- `plan-territoires.md` — découpage territorial
- `moat-et-avatar-chefs.md` — profil idéal chef d'équipe
- `outils-execution-codie.md` — outils Codie Sanchez adaptés
- `SOP-TEMPLATE.md` — template de procédures

### Recrutement (2026)
- `recrutement/travailleurs-guatemalteques-2026.md` — Juan Luis + Julio Cesar (Equinox World)
  - **Juan Luis (1907)** : expérience Les Haies Julien 2025, superviseur d'équipe → potentiel chef
  - **Julio Cesar (G33)** : 11 ans, machinerie lourde, GTL Paysagiste Canada
  - Coût total estimé : ~89 000 $/saison

### Fournisseurs
- `factures-fournisseurs.md` — ShooGa Marketing INV-774131 (965,79 $, hébergement web 35 $/mois)

---

## 6. Systèmes IA (`systemes-ia/`)

- `WORKFLOW-AUTOMATISATION-COMPLET.md` — workflow global
- `automations-completes.md` — détail de toutes les automatisations
- `MAXIMISATION-REVENUS.md` — leviers IA sur revenus
- `TRACKING-TEMPS-INCENTIVES.md` — tracking + incentives équipes
- `ia-traducteur-tet.md` — IA traducteur terrain

---

## 7. Recherche de marché (`recherche-marche/`)

- 2 analyses du marché résidentiel haies au Québec
- Taille du marché services résidentiels
- Appels d'offres publics : MERX + SEAO (mars 2026)

---

## 8. ServiceM8 (`servicem8-docs/`)

27 chapitres de documentation complète :
authentification, webhooks, REST API, feed API, messaging, custom fields, addon SDK, MCP server, manifest reference, etc.

---

## 9. Quick-ref (`quick-ref/`)

10 guides de référence rapide :
01-prospection · 02-évaluation · 03-négociation · 04-financement · 05-optimisation · 06-protection · 07-exit · 08-systèmes · 09-leadership · 10-décisions

---

## Ce qui est complet ✅

| Zone | Status |
|---|---|
| Base de connaissances (14 livres + 13 frameworks) | ✅ |
| Plan d'affaires + roadmaps | ✅ |
| Stratégie saison 2026 | ✅ |
| App haie-lite-app (scaffold complet) | ✅ |
| Docs ServiceM8 | ✅ |
| Recrutement TET 2026 (Juan + Julio confirmés) | ✅ |
| Systèmes IA + automatisations | ✅ |

---

## Ce qui manque ❌

### Finance (critique)

| Document | Priorité |
|---|---|
| Grille de prix par service ($/pied linéaire) | 🔴 URGENT |
| Modèle financier Excel interactif | 🔴 URGENT |
| Budget saisonnier détaillé | 🟡 Important |
| Template facture client | 🟢 Moyen |

### Légal (critique)

| Document | Priorité |
|---|---|
| Convention actionnaires JS / Henri | 🔴 URGENT |
| Contrat client | 🔴 URGENT |
| Contrat TET / employé | 🟡 Important |
| Structure corporative documentée | 🟢 Moyen |

### RH / Formation

| Document | Priorité |
|---|---|
| Manuel employé | 🟡 Important |
| Programme formation semaine 1 | 🟡 Important |
| Grille salariale | 🟢 Moyen |

### SOPs terrain

| SOP | Priorité |
|---|---|
| Taillage haies cèdres | 🔴 URGENT |
| Taillage haies feuillus | 🟡 Important |
| Fin de job / nettoyage / photos | 🟡 Important |
| Gestion plainte client | 🟡 Important |

---

## Points d'attention techniques

| Observation | Action |
|---|---|
| **`.next/` commité** | Ajouter au `.gitignore` |
| **Dossiers `api 2/3/4/5`** | Supprimer les doublons dans `haie-lite-app/app/` |
| **`.env.local` présent** | Vérifier qu'il est dans `.gitignore` |
| **iCloud eviction** | Ouvrir dans Finder pour forcer le download local avant de travailler |

---

## Résumé stratégique

Ce repo est un **système d'exploitation complet pour une PME de services résidentiels** :

```
Stratégie → Exécution → Opérations → Tech → Automatisation → M&A
```

La couche tech (`haie-lite-app`) couvre le cycle complet :
**acquisition client → devis → paiement → exécution terrain → paie → fidélisation → upsell**

avec 12 automatisations CRON, 5 intégrations tierces, et une architecture prête pour le multi-territoire.

---

*Analyse initiale : 2026-01-24 | Mise à jour : 2026-03-23*
