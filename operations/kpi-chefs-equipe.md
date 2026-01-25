# KPIs Chefs d'Equipe - Inspire VETA RH System

> Systeme de tracking performance adapte au paysagisme

---

## STRUCTURE HIERARCHIQUE

```
Jean-Samuel (Systemes) ← Dashboard global
         ↓
     Henri (COO) ← KPIs agreges toutes equipes
         ↓
   Chefs d'equipe (Crew Leaders) ← KPIs par equipe
         ↓
       TET (Executants) ← Heures + jobs
```

---

## KPIs QUOTIDIENS (Daily)

### Par Chef d'Equipe - Fin de journee

| KPI | Cible | Formule |
|-----|-------|---------|
| **Jobs completes** | 4-8/jour | Compte jobs signes |
| **Revenus du jour** | 800-2000$/jour | Somme factures |
| **Heures travaillees** | 8-10h | Horodatage debut/fin |
| **Taux completion** | >95% | Jobs faits / Jobs planifies |
| **Callbacks** | 0 | Clients qui rappellent pour probleme |
| **Photos avant/apres** | 100% | Jobs avec photos / Total jobs |

### Saisie Rapide (Mobile)

```
[ ] Job #1: Adresse | $ montant | ✓ photo | ✓ paye
[ ] Job #2: Adresse | $ montant | ✓ photo | ✓ paye
...
Heures: __:__ a __:__
Km parcourus: ___
Notes: ___________
```

---

## KPIs HEBDOMADAIRES (Weekly)

### Par Chef d'Equipe - Vendredi soir

| KPI | Cible | Benchmark |
|-----|-------|-----------|
| **Revenus semaine** | 5-10k$ | Top performers: 12k$+ |
| **Jobs semaine** | 25-40 | Moyenne industrie: 20-30 |
| **Marge brute equipe** | >60% | (Revenus - Couts directs) / Revenus |
| **Satisfaction client** | >4.5/5 | Sondage SMS post-job |
| **Retards** | <5% | Jobs en retard / Total |
| **Upsells** | 2-3/sem | Services additionnels vendus |

### Rapport Hebdo Automatise

```markdown
## Semaine du [DATE]

### Performance Equipe [NOM]
- Revenus: $X,XXX (↑/↓ vs semaine passee)
- Jobs: XX completes
- Marge: XX%
- Satisfaction: X.X/5

### Top 3 Wins
1. ...
2. ...
3. ...

### Problemes a regler
1. ...

### Prevision semaine prochaine
- Jobs planifies: XX
- Revenus attendus: $X,XXX
```

---

## KPIs MENSUELS (Monthly)

### Par Chef d'Equipe

| KPI | Cible | Impact Bonus |
|-----|-------|--------------|
| **Revenus mois** | 25-40k$ | Base du bonus |
| **Marge nette equipe** | >20% | Multiplie bonus |
| **Retention clients** | >85% | Clients qui rebookent |
| **NPS** | >50 | Promoteurs - Detracteurs |
| **Incidents securite** | 0 | CNESST compliance |
| **Turnover TET** | 0% | TET qui quittent |
| **Formation completee** | 100% | Heures formation vs requises |

### Scorecard Mensuel

```
╔══════════════════════════════════════════════════════╗
║  SCORECARD - [NOM CHEF EQUIPE] - [MOIS]              ║
╠══════════════════════════════════════════════════════╣
║  REVENUS        $XX,XXX    [███████░░░] 85%          ║
║  MARGE          XX%        [████████░░] 90%          ║
║  SATISFACTION   X.X/5      [█████████░] 95%          ║
║  COMPLETION     XX%        [██████████] 100%         ║
╠══════════════════════════════════════════════════════╣
║  SCORE GLOBAL: XX/100      RANG: #X sur Y            ║
║  BONUS ESTIME: $X,XXX                                ║
╚══════════════════════════════════════════════════════╝
```

---

## DASHBOARDS (Inspire VETA RH)

### Dashboard Henri (COO) - Vue Globale

```
┌─────────────────────────────────────────────────────────┐
│ HAIE LITE - Dashboard Operations                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  AUJOURD'HUI                    CETTE SEMAINE            │
│  ┌──────────────┐               ┌──────────────┐        │
│  │ $4,250       │               │ $18,750      │        │
│  │ Revenus      │               │ Revenus      │        │
│  └──────────────┘               └──────────────┘        │
│                                                          │
│  EQUIPES EN COURS                                        │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🟢 Equipe A (Pedro) - 3/6 jobs - $1,250        │    │
│  │ 🟢 Equipe B (Carlos) - 4/5 jobs - $1,800       │    │
│  │ 🟡 Equipe C (Miguel) - 2/7 jobs - $700         │    │
│  │ 🔴 Equipe D (Jose) - EN RETARD - 1 callback    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ALERTES                                                 │
│  ⚠️ Equipe D: Callback client 514-XXX-XXXX              │
│  ⚠️ Stock echelles: 2 restantes                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Dashboard Jean-Samuel (Systemes) - Vue Strategique

```
┌─────────────────────────────────────────────────────────┐
│ HAIE LITE - Dashboard Strategique                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  CE MOIS                        YTD (Saison)             │
│  ┌──────────────┐               ┌──────────────┐        │
│  │ $85,000      │               │ $425,000     │        │
│  │ CA           │               │ CA           │        │
│  │ +15% vs LY   │               │ +70% vs LY   │        │
│  └──────────────┘               └──────────────┘        │
│                                                          │
│  METRIQUES CLES                                          │
│  ├── Marge brute: 68% (cible: 65%)          ✓          │
│  ├── CAC moyen: $45 (cible: <$100)          ✓          │
│  ├── LTV/CAC: 85:1 (cible: >20:1)           ✓          │
│  ├── DSO: 12 jours (cible: <30)             ✓          │
│  └── NPS: 62 (cible: >50)                   ✓          │
│                                                          │
│  PROJECTION FIN SAISON                                   │
│  ┌─────────────────────────────────────────────────┐    │
│  │ CA prevu: $520k     EBITDA prevu: $83k (16%)   │    │
│  │ [██████████████████░░░░░░░░░░] 65% complete     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## SYSTEME DE BONUS PERFORMANCE

### Structure Mensuelle

| Score | Niveau | Bonus |
|-------|--------|-------|
| 90-100 | Exceptionnel | 15% du salaire |
| 80-89 | Excellent | 10% du salaire |
| 70-79 | Bon | 5% du salaire |
| 60-69 | Acceptable | 0% |
| <60 | Insuffisant | Plan d'amelioration |

### Calcul Score (100 points)

| Critere | Poids | Max Points |
|---------|-------|------------|
| Revenus vs cible | 40% | 40 |
| Marge vs cible | 25% | 25 |
| Satisfaction client | 20% | 20 |
| Completion + photos | 10% | 10 |
| Zero incidents | 5% | 5 |

---

## INTEGRATION TECH STACK

### Sources de Donnees

| Donnee | Source | Frequence |
|--------|--------|-----------|
| Jobs + factures | Jobber | Temps reel |
| Heures | Agendrix | Quotidien |
| Photos | App mobile | Temps reel |
| Satisfaction | SMS Twilio | 24h post-job |
| Finances | QuickBooks | Hebdo |

### Automatisations (comme VETA RH)

1. **Rapport quotidien** → SMS/email a Henri a 18h
2. **Alerte callback** → Notification immediate
3. **Rapport hebdo** → Email dimanche soir
4. **Scorecard mensuel** → Dashboard + PDF auto

---

## EXEMPLE TABLEAU BORD CHEF EQUIPE

### Vue Mobile (App)

```
┌────────────────────────────┐
│  Bonjour Pedro! 👷         │
│  Mardi 15 juillet          │
├────────────────────────────┤
│                            │
│  AUJOURD'HUI               │
│  ┌────────────────────┐    │
│  │ 6 jobs planifies   │    │
│  │ $1,850 prevu       │    │
│  └────────────────────┘    │
│                            │
│  PROGRESSION               │
│  [████░░░░░░] 3/6 (50%)    │
│  $925 factures             │
│                            │
│  PROCHAIN JOB              │
│  ┌────────────────────┐    │
│  │ 📍 123 Rue Maple   │    │
│  │ ⏰ 14:30           │    │
│  │ 💰 $350            │    │
│  │ [NAVIGUER] [APPEL] │    │
│  └────────────────────┘    │
│                            │
│  [+ SAISIR JOB COMPLETE]   │
│                            │
└────────────────────────────┘
```

---

## A CONSTRUIRE (Phase 1)

### MVP - 2-4 semaines

1. **Google Sheets dashboard** (gratuit, rapide)
2. **Formulaire saisie quotidienne** (Google Forms → Sheets)
3. **Rapport hebdo automatise** (Apps Script)
4. **Alertes Slack/SMS** (Zapier ou n8n)

### Phase 2 - Quand CA > 500k$

1. **App mobile custom** (React Native ou Flutter)
2. **Integration Jobber API**
3. **Dashboard Power BI** (comme VETA RH)
4. **Scoring automatise**
