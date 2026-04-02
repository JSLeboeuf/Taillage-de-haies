# Claude CEO Agent — Haie Lite

**Date** : 1er avril 2026
**Auteur** : Jean-Samuel Leboeuf + Claude Opus 4.6
**Objectif** : Transformer Claude Code en co-CEO autonome de Haie Lite pour atteindre 2M$ CA en 2026

---

## Le probleme

Henri est seul sur le terrain. JS est le cerveau tech/strategie mais ne peut pas etre present 24/7.
L'entreprise a besoin d'un **operating system vivant** qui :
- Surveille les KPIs en temps reel
- Execute les taches repetitives sans intervention
- Prend des decisions operationnelles dans un cadre defini
- Escalade les decisions strategiques aux humains
- Maintient la memoire parfaite de chaque interaction, decision, et engagement

---

## Ce qui existe deja

### Infrastructure technique (prete)
- **44 routes API** (Next.js 15 + Supabase + Vercel)
- **13 cron jobs** configures (KPI, payroll, relance, reviews, meteo, reactivation)
- **25 automations** documentees (quotidiennes, hebdo, mensuelles)
- **Receptionniste IA** VAPI en production
- **SMS AI Qualifier** (Sophie) pret a deployer
- **73 prospects M&A** dans le pipeline
- **23 secrets Haie Lite** dans Infisical

### Outils MCP connectes
| Outil | Usage CEO |
|-------|-----------|
| Supabase | Base de donnees — KPIs, leads, acquisitions, paie |
| Gmail | Communications — leads, fournisseurs, Shooga, Service QC |
| Google Calendar | Scheduling — meetings, deadlines, rappels |
| Notion | Documentation — SOPs, meeting notes, wiki |
| Close CRM | Pipeline vente — leads, opportunites, activites |
| Clay | Enrichissement — trouver prospects M&A, leads B2B |
| Canva | Marketing — visuels, posts sociaux, presentations |

### Donnees business
- **Objectif** : 2M$ CA, 314K$ EBITDA (14%), 4444 clients, ticket moyen 450$
- **3 goulots** : chefs d'equipe (5 requis), capital (275K$), temps (12 semaines)
- **Break-even** : avril 2026
- **Score execution** : 2.5/10 au 19 fevrier → a mesurer aujourd'hui

---

## Architecture du CEO Agent

```
┌─────────────────────────────────────────────────┐
│              CLAUDE CEO AGENT                    │
│  Memoire: MEMORY.md + HANDOFF.md + Supabase     │
│  Rythme: Daily standup → Weekly review → Monthly │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ VENTES & │  │OPERATIONS│  │ FINANCE  │      │
│  │MARKETING │  │ & TERRAIN│  │ & CASH   │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │   M&A    │  │    RH    │  │   TECH   │      │
│  │ GROWTH   │  │  PEOPLE  │  │  & IA    │      │
│  └──────────┘  └──────────┘  └──────────┘      │
│                                                  │
├─────────────────────────────────────────────────┤
│  ESCALATION: Rouge → JS + Henri en <1h          │
│  AUTONOMIE:  Vert → Execute sans demander        │
│  JAUNE:      Propose + attend confirmation       │
└─────────────────────────────────────────────────┘
```

---

## Cadre de decision — Autonomie vs Escalation

### VERT — Claude execute seul
- Envoyer des rapports/summaries par email (apres template approuve)
- Mettre a jour les KPIs dans Supabase
- Relancer les leads selon la sequence definie
- Monitorer les reviews Google et alerter si <4 etoiles
- Publier du contenu social pre-approuve
- Mettre a jour la documentation (SOPs, HANDOFF, MEMORY)
- Creer des analyses et recommandations
- Repondre aux questions RH standard (paie, horaires)
- Optimiser le SEO (nouvelles pages, meta tags)
- Tracker les deadlines et envoyer des rappels

### JAUNE — Claude propose, humain approuve
- Envoyer un email a un prospect M&A ou fournisseur
- Modifier le prix ou la strategie de pricing
- Changer le prompt de la receptionniste IA
- Lancer une nouvelle campagne ads
- Faire une offre d'acquisition
- Engager une depense > 500$
- Modifier un workflow automatise
- Communiquer avec Shooga ou des partenaires externes

### ROUGE — Toujours escalader
- Decisions de financement / capital
- Embauche ou congediement
- Signature de contrat
- Decisions legales (REQ, convention actionnaires)
- Acces a des comptes bancaires
- Communication client sensible (plainte, litige)
- Tout ce qui engage l'entreprise juridiquement

---

## Rythme operationnel

### Quotidien — "Daily Standup" (7h00 EDT)

```
/ceo-daily

1. CHECK SUPABASE
   - Nouveaux leads depuis hier
   - Leads non-traites > 1h (ALERTE ROUGE)
   - Conversations SMS actives
   - Appointments a venir

2. CHECK FINANCIER
   - Revenus yesterday (si ServiceM8 connecte)
   - Factures impayees > 30 jours
   - Cash projection 7 jours

3. CHECK MARKETING
   - Ads spend vs budget
   - CPL par canal
   - Reviews Google recues
   - Trafic site (Clarity)

4. GENERER BRIEF
   - 5 lignes max pour Henri (SMS-friendly)
   - Actions du jour prioritaires
   - Alertes si red flags

5. PUSH
   - Brief dans Notion
   - SMS a Henri si urgent
   - Email recap a JS
```

### Hebdomadaire — "Weekly Review" (dimanche 20h)

```
/ceo-weekly

1. SCORECARD
   - Clients cette semaine vs target (34/jour)
   - Revenus vs trajectoire 2M$
   - CAC par canal
   - NPS / satisfaction
   - Pipeline M&A mouvement

2. DECISIONS LOG
   - Decisions prises cette semaine
   - Decisions reportees et pourquoi
   - Engagements pris (par qui, deadline)

3. BLOCKERS
   - Qu'est-ce qui nous empeche d'avancer?
   - Quels goulots sont actifs?
   - Quelles ressources manquent?

4. NEXT WEEK
   - Top 3 priorities
   - Deadlines a venir
   - Meetings planifies
```

### Mensuel — "Board Report" (1er du mois)

```
/ceo-monthly

1. P&L FLASH
   - Revenus, couts, EBITDA vs budget
   - Variance analysis

2. KPI DASHBOARD
   - Tous les KPIs du TEMPLATE-SUIVI-MENSUEL.md
   - Tendances (amelioration/degradation)

3. PIPELINE M&A
   - Statut de chaque cible
   - Due diligence progression
   - Prochaines etapes

4. RECOMMANDATIONS STRATEGIQUES
   - Ce qui fonctionne → doubler
   - Ce qui ne fonctionne pas → pivoter
   - Opportunites identifiees
   - Risques a mitiger
```

---

## Implementation technique

### Phase 1 — Fondations (cette semaine)

#### 1.1 Skill `/ceo-daily`
```bash
# Cree comme un skill Claude Code qui:
# - Query Supabase pour les KPIs du jour
# - Check Gmail pour les emails importants
# - Check Google Calendar pour les RDV
# - Genere un brief et le push
```

#### 1.2 Skill `/ceo-weekly`
```bash
# Skill qui genere le scorecard hebdomadaire
# Compare les actuals vs le MODELE-FINANCIER-2026.md
# Identifie les ecarts et recommande des actions
```

#### 1.3 Skill `/ceo-status`
```bash
# Check rapide: ou en est-on vs le plan 2M$?
# Query toutes les sources, retourne un dashboard texte
```

#### 1.4 Memoire structuree
```
memory/
├── MEMORY.md           # Vue globale (existe)
├── decisions-log.md    # Historique decisions
├── kpi-history.md      # KPIs semaine par semaine
├── acquisition-details.md  # Pipeline M&A detaille
├── blockers.md         # Goulots actifs et solutions
└── commitments.md      # Engagements pris (qui, quoi, quand)
```

### Phase 2 — Departements (semaine prochaine)

#### 2.1 Agent Ventes & Marketing
- Monitor leads en temps reel (Supabase realtime)
- Tracker CPL et ROAS par canal
- Generer contenu social (Canva + scheduler)
- Optimiser SEO continu
- Alerter si lead > 5min sans reponse

#### 2.2 Agent Operations
- Sync ServiceM8 → Supabase (timesheets, jobs)
- Weather alerts → replanning crews
- Equipment maintenance tracking
- Route optimization suggestions

#### 2.3 Agent Finance
- Cash flow monitoring quotidien
- AR aging alerts (>30j, >60j)
- Budget vs actual tracking
- Subvention deadlines et status

#### 2.4 Agent M&A
- Pipeline 73 prospects: track responses
- Due diligence checklist automation
- Valuation models par cible
- LOI drafting assistance

#### 2.5 Agent RH
- Recruitment pipeline tracking
- TET visa timeline monitoring
- Payroll validation
- Performance scoring

### Phase 3 — Autonomie (mois prochain)

#### 3.1 Loop autonome
```bash
# /loop qui tourne toutes les 4 heures:
# - Check nouveaux leads
# - Check emails non-lus importants
# - Check KPIs vs thresholds
# - Execute actions automatiques (relances, rappels)
# - Log tout dans decisions-log.md
```

#### 3.2 Triggers evenementiels
- Nouveau lead → classification + routing automatique
- Review negative → alerte + draft reponse
- Facture impayee > 45j → sequence escalation
- Cash < 30k$ → alerte rouge + plan d'action
- Nouveau prospect M&A repond → analyse immediate

#### 3.3 Intelligence decisionnelle
- Pattern recognition sur les donnees historiques
- Predictions revenus basees sur pipeline + saisonnalite
- Recommandations pricing basees sur demande/capacite
- Identification proactive d'opportunites

---

## KPIs du CEO Agent lui-meme

| Metrique | Target | Comment mesurer |
|----------|--------|-----------------|
| Temps de reponse aux leads | < 5 min | Supabase: lead_created_at vs first_contact_at |
| Daily brief envoye | 100% | Notion/email log |
| Weekly review complete | 100% | Memory log |
| Decisions autonomes/semaine | 10+ | decisions-log.md |
| Escalations/semaine | < 5 | decisions-log.md |
| Accuracy des previsions | > 80% | Forecast vs actual |
| Temps JS economise/semaine | 10h+ | Estimation |

---

## Contraintes de securite

1. **Jamais** envoyer d'email sans draft approuve (CLAUDE.md rule)
2. **Jamais** committer de secrets
3. **Jamais** supprimer de donnees — archiver seulement
4. **Jamais** engager l'entreprise financierement ou legalement
5. **Toujours** logger les decisions dans decisions-log.md
6. **Toujours** citer la source de donnees dans les recommandations
7. **Toujours** comparer avec le plan (PLAN-EXECUTION-2M-2026.md) avant de recommander

---

## Premiere action du CEO Agent

### Diagnostic immediat — Ou en est-on au 1er avril 2026?

| Dimension | Target Q1 | Actual | Gap | Action |
|-----------|-----------|--------|-----|--------|
| Chefs d'equipe | 3 recrutes | 1 (Henri) | -2 | URGENT: recruter 2 chefs |
| Capital | 275k$ secure | ~14k$ cash | -261k$ | Subventions + seller financing |
| Clients reserves | 300+ | ~81k$/450$ = ~180 | -120 | Finir appels + SEO + ads |
| Acquisitions | 1 LOI signee | 0, 73 prospects | -1 | Activer campagne email |
| Tech | ServiceM8 prod | Partial | Gap | Deployer Sophie + tracking |
| Marketing | Ads live + SEO | SEO fait, ads demarrent | 60% | GBP + augmenter budget |

**Score d'execution au 1er avril : ~3.5/10** (ameliore vs 2.5 en fevrier, mais loin du cible)

**Les 3 actions les plus impactantes cette semaine :**
1. **Deployer Sophie SMS** (leads qualifies auto = plus de conversions)
2. **Activer la campagne acquisitions** (73 prospects, 0 emails envoyes)
3. **Obtenir admin WordPress** (debloquer tracking + schemas + GBP)

---

## Comment utiliser le CEO Agent au quotidien

```bash
# Le matin — brief rapide
/ceo-daily

# Avant un meeting — contexte complet
/ceo-status

# Fin de semaine — revue
/ceo-weekly

# Besoin d'une decision — analyse
"Claude, est-ce qu'on devrait acheter la business de Martin a 650K$?"
→ Analyse ROI, cash impact, financement, risques, recommandation

# Delegation — execution
"Claude, envoie les emails aux 73 prospects d'acquisition"
→ Draft les emails, montre pour approbation, envoie

# Suivi — accountability
"Claude, qu'est-ce qu'Henri devait faire cette semaine?"
→ Check commitments.md, compare avec les actions realisees
```

---

*Ce document est le blueprint. L'implementation commence maintenant.*
